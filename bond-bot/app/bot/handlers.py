from __future__ import annotations

from datetime import datetime
from typing import Optional

from aiogram import Router, F
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery, FSInputFile, BufferedInputFile, InlineKeyboardMarkup

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.i18n import t
from app.models import User, Lang, Role, Olympiad, Direction, Grouping, GroupOption, Registration
from app.bot.utils import send_olympiad_list
from app.bot.states import ProfileStates, RegistrationStates, AdminLoginStates, AdminStates
from app.bot.keyboards import (
    lang_keyboard,
    role_keyboard,
    contact_keyboard,
    main_menu,
    register_button,
    olympiad_list_kb,
    olympiad_register_btn,
    directions_kb,
    groups_kb,
    grades_kb,
    langs_kb,
    confirm_kb,
    confirm_with_edit_kb,
    edit_menu_kb,
    regions_kb,
    districts_kb,
)
from app.ticket import generate_ticket_id, render_ticket
from app.config import config
from app.bot.integrations import push_registration


router = Router()


async def get_or_create_user(session: AsyncSession, tg_user_id: int) -> User:
    result = await session.execute(select(User).where(User.tg_user_id == tg_user_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(tg_user_id=tg_user_id)
        session.add(user)
        await session.flush()
    return user


def parse_lang(value: str) -> Lang:
    return Lang[value]


def parse_role(value: str) -> Role:
    return Role[value]


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    await state.clear()
    # If user already has profile, skip onboarding
    if user.language and user.role and user.name and user.phone:
        await message.answer(t(user.language, "menu.title"), reply_markup=main_menu(user.language))
        return
    await state.set_state(ProfileStates.waiting_language)
    await message.answer(t(Lang.UZ, "start.welcome"), reply_markup=lang_keyboard())


@router.callback_query(F.data.startswith("lang:"))
async def set_language(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    _, code = cb.data.split(":", 1)
    lang = parse_lang(code)
    user = await get_or_create_user(session, cb.from_user.id)
    user.language = lang
    await session.commit()
    await state.set_state(ProfileStates.waiting_role)
    await cb.message.edit_text(t(lang, "register.role.ask"), reply_markup=role_keyboard(lang))


@router.callback_query(F.data.startswith("role:"))
async def set_role(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    _, rcode = cb.data.split(":", 1)
    user.role = parse_role(rcode)
    await session.commit()
    await state.set_state(ProfileStates.waiting_name)
    await cb.message.answer(t(lang, "register.name.ask"))


@router.message(ProfileStates.waiting_name)
async def set_name(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    user.name = message.text.strip()
    await session.commit()
    await state.set_state(ProfileStates.waiting_phone)
    await message.answer(t(lang, "register.phone.ask"), reply_markup=contact_keyboard(t(lang, "register.phone.btn")))


@router.message(ProfileStates.waiting_phone, F.contact)
async def set_phone_contact(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    user.phone = message.contact.phone_number
    await session.commit()
    await state.clear()
    await message.answer(t(lang, "menu.title"), reply_markup=main_menu(lang))


@router.message(F.text.in_({"Olimpiadalar", "Олимпиады", "Olympiads"}))
async def list_olympiads(message: Message, session: AsyncSession):
    await send_olympiad_list(message, session)


@router.callback_query(F.data.startswith("ol:open:"))
async def open_olympiad(cb: CallbackQuery, session: AsyncSession):
    oid = int(cb.data.split(":")[2])
    o = await session.get(Olympiad, oid)
    if not o:
        await cb.answer("Not found")
        return
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    # remove inline keyboard of olympiad list
    try:
        await cb.message.edit_reply_markup(reply_markup=None)
    except Exception:
        await session.commit()
    cap = (
        f"{o.name}\n\n{(o.description or '')}\n\n"
        f"Sana: {o.event_at.strftime('%Y-%m-%d %H:%M')}\n"
        f"Manzil: {o.address}\n"
        f"Tel: {o.contact_phone}\n\n@bond_olympiad"
    )
    if o.poster_path:
        try:
            import os
            p = o.poster_path
            if p.lower().endswith('.mp4') and os.path.exists(p) and os.path.getsize(p) <= 15 * 1024 * 1024:
                await cb.message.answer_video(FSInputFile(p), caption=cap, reply_markup=olympiad_register_btn(lang, o.id))
            else:
                await cb.message.answer_photo(FSInputFile(p), caption=cap, reply_markup=olympiad_register_btn(lang, o.id))
        except Exception:
            await cb.message.answer(cap, reply_markup=olympiad_register_btn(lang, o.id))
    else:
        await cb.message.answer(cap, reply_markup=olympiad_register_btn(lang, o.id))


@router.callback_query(F.data.startswith("ol:reg:"))
async def start_registration(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    oid = int(cb.data.split(":")[2])
    # remove inline keyboard under olympiad info when registration starts
    try:
        await cb.message.edit_reply_markup(reply_markup=None)
    except Exception:
        pass
    await state.update_data(start_message_id=cb.message.message_id, olympiad_id=oid)
    await cb.message.answer(t(lang, "register.flow.start"))
    # First ask for full name
    await state.set_state(RegistrationStates.entering_fullname)
    await cb.message.answer(t(lang, "register.name.ask"))


@router.message(RegistrationStates.entering_fullname)
async def reg_fullname(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    full_name = (message.text or '').strip()
    if not full_name:
        await message.answer(t(lang, "register.name.ask"))
        return
    await state.update_data(full_name=full_name)
    # Show directions as buttons
    data = await state.get_data()
    oid = data.get('olympiad_id')
    result = await session.execute(select(Direction).where(Direction.olympiad_id == oid))
    dirs = result.scalars().all()
    if not dirs:
        await message.answer(t(lang, "register.ask.direction") + "\n(No directions; admin must add)")
    else:
        await message.answer(t(lang, "register.ask.direction"), reply_markup=directions_kb(dirs))
    await state.set_state(RegistrationStates.choosing_direction)


@router.callback_query(RegistrationStates.choosing_direction, F.data.startswith("dir:"))
async def choose_direction_cb(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    did = int(cb.data.split(":")[1])
    d = await session.get(Direction, did)
    if not d:
        user = await get_or_create_user(session, cb.from_user.id)
        await cb.answer(t(user.language or Lang.UZ, "error.invalid_id"), show_alert=True)
        return
    await state.update_data(direction_id=d.id)
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    if d.grouping == Grouping.CLASS:
        await state.set_state(RegistrationStates.choosing_grade)
        await cb.message.answer(t(lang, "register.ask.class"), reply_markup=grades_kb())
    else:
        result = await session.execute(select(GroupOption).where(GroupOption.direction_id == d.id).order_by(GroupOption.order))
        groups = result.scalars().all()
        if not groups:
            await cb.message.answer(t(lang, "error.not_found"))
        else:
            await cb.message.answer(t(lang, 'register.ask.group'), reply_markup=groups_kb(groups))
        await state.set_state(RegistrationStates.choosing_group)


@router.message(RegistrationStates.choosing_direction)
async def choose_direction(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    try:
        did = int(message.text.strip())
    except Exception:
        await message.answer("Send a valid numeric ID")
        return
    d = await session.get(Direction, did)
    if not d:
        await message.answer("Invalid direction ID")
        return
    await state.update_data(direction_id=d.id)
    if d.grouping == Grouping.CLASS:
        await state.set_state(RegistrationStates.entering_grade)
        await message.answer(t(lang, "register.ask.class"))
    else:
        # list group options
        result = await session.execute(select(GroupOption).where(GroupOption.direction_id == d.id).order_by(GroupOption.order))
        groups = result.scalars().all()
        if not groups:
            await message.answer("No groups configured; admin must add")
        else:
            lines = [f"[{g.id}] {g.name}" for g in groups]
            await message.answer("\n".join(lines) + f"\n\n{t(lang, 'register.ask.group')}: send ID")
        await state.set_state(RegistrationStates.choosing_group)


@router.callback_query(RegistrationStates.choosing_group, F.data.startswith("grp:"))
async def choose_group_cb(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    gid = int(cb.data.split(":")[1])
    g = await session.get(GroupOption, gid)
    if not g:
        user = await get_or_create_user(session, cb.from_user.id)
        await cb.answer(t(user.language or Lang.UZ, "error.invalid_id"), show_alert=True)
        return
    await state.update_data(group_option_id=g.id)
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    if (await state.get_data()).get("review_mode"):
        await show_summary(cb, state, session)
    else:
        await state.set_state(RegistrationStates.entering_birth)
        await cb.message.answer(t(lang, "register.ask.birth"))


@router.callback_query(RegistrationStates.choosing_grade, F.data.startswith("grade:"))
async def set_grade_cb(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    grade = cb.data.split(":")[1]
    await state.update_data(grade=grade)
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    if (await state.get_data()).get("review_mode"):
        await show_summary(cb, state, session)
    else:
        await state.set_state(RegistrationStates.entering_birth)
        await cb.message.answer(t(lang, "register.ask.birth"))


@router.message(RegistrationStates.entering_birth)
async def set_birth(message: Message, state: FSMContext, session: AsyncSession):
    await state.update_data(birth_date=message.text.strip())
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    if (await state.get_data()).get("review_mode"):
        await show_summary(message, state, session)
    else:
        await state.set_state(RegistrationStates.choosing_region)
        await message.answer(t(lang, "register.ask.region"), reply_markup=regions_kb())


@router.callback_query(RegistrationStates.choosing_region, F.data.startswith("reg:"))
async def choose_region(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    region = cb.data.split(":",1)[1]
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    if region == "__other__":
        await state.set_state(RegistrationStates.entering_region_text)
        await cb.message.answer(t(lang, "register.ask.region"))
        return
    await state.update_data(region=region)
    await state.set_state(RegistrationStates.choosing_district)
    await cb.message.answer(t(lang, "register.ask.district"), reply_markup=districts_kb(region))


@router.callback_query(RegistrationStates.choosing_district, F.data.startswith("dist:"))
async def choose_district(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    district = cb.data.split(":",1)[1]
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    if district == "__other__":
        await state.set_state(RegistrationStates.entering_district_text)
        await cb.message.answer(t(lang, "register.ask.district"))
        return
    await state.update_data(district=district)
    if (await state.get_data()).get("review_mode"):
        await show_summary(cb, state, session)
    else:
        await state.set_state(RegistrationStates.entering_school)
        await cb.message.answer(t(lang, "register.ask.school"))


@router.message(RegistrationStates.entering_region_text)
async def enter_region_text(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    await state.update_data(region=(message.text or '').strip())
    await state.set_state(RegistrationStates.entering_district_text)
    await message.answer(t(user.language or Lang.UZ, "register.ask.district"))


@router.message(RegistrationStates.entering_district_text)
async def enter_district_text(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    await state.update_data(district=(message.text or '').strip())
    if (await state.get_data()).get("review_mode"):
        await show_summary(message, state, session)
    else:
        await state.set_state(RegistrationStates.entering_school)
        await message.answer(t(user.language or Lang.UZ, "register.ask.school"))


@router.message(RegistrationStates.entering_school)
async def set_school(message: Message, state: FSMContext, session: AsyncSession):
    await state.update_data(school=message.text.strip())
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    # Ask phone for registration
    await state.set_state(RegistrationStates.entering_phone_reg)
    from app.bot.keyboards import contact_keyboard
    await message.answer(t(lang, "register.phone.ask"), reply_markup=contact_keyboard(t(lang, "register.phone.btn")))


@router.message(RegistrationStates.entering_phone_reg, F.contact)
async def reg_phone_contact(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    user.phone = message.contact.phone_number
    await session.commit()
    if (await state.get_data()).get("review_mode"):
        await show_summary(message, state, session)
    else:
        await ask_exam_language(message, state, session)


@router.message(RegistrationStates.entering_phone_reg)
async def reg_phone_text(message: Message, state: FSMContext, session: AsyncSession):
    # Accept plain text phone if provided
    user = await get_or_create_user(session, message.from_user.id)
    txt = (message.text or '').strip()
    if not txt:
        await message.answer("Iltimos telefon raqam yuboring")
        return
    user.phone = txt
    await session.commit()
    if (await state.get_data()).get("review_mode"):
        await show_summary(message, state, session)
    else:
        await ask_exam_language(message, state, session)


async def ask_exam_language(message: Message, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    data = await state.get_data()
    olympiad = await session.get(Olympiad, data.get("olympiad_id")) if data.get("olympiad_id") else None
    allowed = []
    if olympiad:
        if olympiad.lang_uz:
            allowed.append("UZ")
        if olympiad.lang_ru:
            allowed.append("RU")
        if olympiad.lang_en:
            allowed.append("EN")
    if not allowed:
        allowed = ["UZ"]
    await state.set_state(RegistrationStates.choosing_lang)
    await message.answer(t(lang, "register.ask.lang"), reply_markup=langs_kb(allowed))


@router.callback_query(RegistrationStates.choosing_lang, F.data.startswith("elang:"))
async def set_exam_lang_cb(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    code = cb.data.split(":")[1]
    await state.update_data(exam_lang=code)
    data = await state.get_data()
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    olympiad: Optional[Olympiad] = await session.get(Olympiad, data.get("olympiad_id")) if data.get("olympiad_id") else None
    direction: Optional[Direction] = await session.get(Direction, data.get("direction_id")) if data.get("direction_id") else None
    group: Optional[GroupOption] = await session.get(GroupOption, data.get("group_option_id")) if data.get("group_option_id") else None
    grade_or_group = group.name if group else (data.get('grade') or '-')
    lines = [
        f"Olimpiada: {olympiad.name if olympiad else '-'}",
        f"Yo'nalish: {direction.name if direction else '-'}",
        f"Ism/Name: {data.get('full_name')}",
        f"Telefon: {user.phone or '-'}",
        f"Tug'ilgan sana: {data.get('birth_date')}",
        f"Hudud: {data.get('region')}",
        f"Tuman: {data.get('district')}",
        f"Maktab: {data.get('school')}",
        f"Sinf/Daraja: {grade_or_group}",
        f"Til: {code}",
    ]
    await state.set_state(RegistrationStates.confirming)
    await cb.message.answer("\n".join(lines), reply_markup=confirm_with_edit_kb(lang))


# Helper to rebuild and show the summary
async def show_summary(from_message: Message | CallbackQuery, state: FSMContext, session: AsyncSession):
    data = await state.get_data()
    user = None
    if isinstance(from_message, CallbackQuery):
        user_id = from_message.from_user.id
    else:
        user_id = from_message.from_user.id
    user = await get_or_create_user(session, user_id)
    lang = user.language or Lang.UZ
    olympiad: Optional[Olympiad] = await session.get(Olympiad, data.get("olympiad_id")) if data.get("olympiad_id") else None
    direction: Optional[Direction] = await session.get(Direction, data.get("direction_id")) if data.get("direction_id") else None
    group: Optional[GroupOption] = await session.get(GroupOption, data.get("group_option_id")) if data.get("group_option_id") else None
    grade_or_group = (group.name if group else (data.get('grade') or '-'))
    lines = [
        f"Olimpiada: {olympiad.name if olympiad else '-'}",
        f"Yo'nalish: {direction.name if direction else '-'}",
        f"Ism/Name: {data.get('full_name')}",
        f"Telefon: {user.phone or '-'}",
        f"Tug'ilgan sana: {data.get('birth_date')}",
        f"Hudud: {data.get('region')}",
        f"Tuman: {data.get('district')}",
        f"Maktab: {data.get('school')}",
        f"Sinf/Daraja: {grade_or_group}",
        f"Til: {data.get('exam_lang')}",
    ]
    await state.set_state(RegistrationStates.confirming)
    if isinstance(from_message, CallbackQuery):
        await from_message.message.answer("\n".join(lines), reply_markup=confirm_with_edit_kb(lang))
    else:
        await from_message.answer("\n".join(lines), reply_markup=confirm_with_edit_kb(lang))


@router.callback_query(RegistrationStates.confirming, F.data == "confirm:no")
async def confirm_no(cb: CallbackQuery, state: FSMContext):
    await state.clear()
    await cb.message.edit_reply_markup()
    await cb.answer("Cancelled")


@router.callback_query(RegistrationStates.confirming, F.data == "confirm:edit")
async def confirm_edit(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    await cb.message.answer("Nimani tahrirlaysiz?", reply_markup=edit_menu_kb())


@router.callback_query(RegistrationStates.confirming, F.data == "confirm:yes")
async def confirm_yes(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    data = await state.get_data()
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    olympiad: Optional[Olympiad] = await session.get(Olympiad, data["olympiad_id"]) if data.get("olympiad_id") else None
    direction: Optional[Direction] = await session.get(Direction, data.get("direction_id")) if data.get("direction_id") else None
    group: Optional[GroupOption] = await session.get(GroupOption, data.get("group_option_id")) if data.get("group_option_id") else None

    ticket_id = generate_ticket_id()
    while (await session.execute(select(Registration).where(Registration.ticket_id == ticket_id))).scalar_one_or_none():
        ticket_id = generate_ticket_id()

    reg = Registration(
        user_id=user.id,
        olympiad_id=olympiad.id if olympiad else None,
        direction_id=direction.id if direction else None,
        group_option_id=group.id if group else None,
        full_name=data.get('full_name') or user.name or cb.from_user.full_name,
        birth_date=data.get("birth_date", ""),
        region=data.get("region", ""),
        district=data.get("district", ""),
        school=data.get("school", ""),
        grade=str(data.get("grade")) if data.get("grade") else None,
        language=Lang[data.get("exam_lang", (user.language or Lang.UZ).value)],
        ticket_id=ticket_id,
    )
    session.add(reg)
    await session.flush()

    # (Optional) still render ticket for storage, but do not send image now
    try:
        path = render_ticket(reg, olympiad, direction, group, reg.language)
        reg.ticket_image_path = path
        await session.commit()
    except Exception:
        pass

        # Text-only message as requested
    msg = (
        "Ro'yxatdan o'tdingiz!\n\n\n\n"
        f"🔖 ID: {reg.ticket_id}\n"
        f"📅 Imtihon o'tkazilish vaqt: {olympiad.event_at.strftime('%Y-%m-%d %H:%M')}\n"
        f"📍 Manzil: {olympiad.address}\n"
        "ℹ️ Iltimos, belgilangan vaqtdan 15 daqiqa oldin yetib keling.\n\n"
        "Yangiliklardan xabardor bo‘ling: @bond_olympiad"
    )
    await push_registration(
        {
            "telegramId": str(cb.from_user.id),
            "telegramUsername": f"@{cb.from_user.username}" if cb.from_user.username else None,
            "fullName": reg.full_name,
            "phone": user.phone or "",
            "olympiadTitle": olympiad.name if olympiad else None,
            "locale": (user.language or Lang.UZ).value.lower(),
            "meta": {
                "ticketId": reg.ticket_id,
                "region": reg.region,
                "district": reg.district,
                "school": reg.school,
                "grade": reg.grade,
                "direction": direction.name if direction else None,
                "group": group.name if group else None
            }
        }
    )
    await cb.message.answer(msg)
    if config.group_chat_id:
        lead_text = (
            f"New registration\n"
            f"Olympiad: {olympiad.name}\n"
            f"User: {reg.full_name}\n"
            f"Phone: {user.phone}\n"
            f"Til: {reg.language.value}\n"
            f"Region: {reg.region}, District: {reg.district}\n"
            f"School: {reg.school}, Grade: {reg.grade or '-'}\n"
            f"Direction: {direction.name if direction else '-'} / Group: {group.name if group else '-'}\n"
            f"Ticket: {reg.ticket_id}"
        )
        try:
            await cb.message.bot.send_message(chat_id=config.group_chat_id, text=lead_text)
        except Exception:
            pass

    await state.clear()
    await cb.message.answer(t(lang, "menu.title"), reply_markup=main_menu(lang))


# Editing specific fields from the review screen
@router.callback_query(RegistrationStates.confirming, F.data.startswith("edit:"))
async def edit_field(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    field = cb.data.split(":")[1]
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    await state.update_data(review_mode=True)
    data = await state.get_data()
    if field == "fullname":
        await state.set_state(RegistrationStates.entering_fullname)
        await cb.message.answer(t(lang, "register.name.ask"))
    elif field == "phone":
        await state.set_state(RegistrationStates.entering_phone_reg)
        await cb.message.answer(t(lang, "register.phone.ask"), reply_markup=contact_keyboard(t(lang, "register.phone.btn")))
    elif field == "birth":
        await state.set_state(RegistrationStates.entering_birth)
        await cb.message.answer(t(lang, "register.ask.birth"))
    elif field == "region":
        await state.set_state(RegistrationStates.choosing_region)
        await cb.message.answer(t(lang, "register.ask.region"), reply_markup=regions_kb())
    elif field == "district":
        region = data.get("region")
        if not region:
            await state.set_state(RegistrationStates.choosing_region)
            await cb.message.answer(t(lang, "register.ask.region"), reply_markup=regions_kb())
        else:
            await state.set_state(RegistrationStates.choosing_district)
            await cb.message.answer(t(lang, "register.ask.district"), reply_markup=districts_kb(region))
    elif field == "school":
        await state.set_state(RegistrationStates.entering_school)
        await cb.message.answer(t(lang, "register.ask.school"))
    elif field == "level":
        did = data.get("direction_id")
        d = await session.get(Direction, did) if did else None
        if d and d.grouping == Grouping.CLASS:
            await state.set_state(RegistrationStates.choosing_grade)
            await cb.message.answer(t(lang, "register.ask.class"), reply_markup=grades_kb())
        else:
            result = await session.execute(select(GroupOption).where(GroupOption.direction_id == did).order_by(GroupOption.order))
            groups = result.scalars().all()
            await state.set_state(RegistrationStates.choosing_group)
            await cb.message.answer(t(lang, 'register.ask.group'), reply_markup=groups_kb(groups))
    elif field == "lang":
        data = await state.get_data()
        olympiad = await session.get(Olympiad, data.get("olympiad_id")) if data.get("olympiad_id") else None
        allowed = []
        if olympiad:
            if olympiad.lang_uz: allowed.append("UZ")
            if olympiad.lang_ru: allowed.append("RU")
            if olympiad.lang_en: allowed.append("EN")
        if not allowed:
            allowed = ["UZ"]
        await state.set_state(RegistrationStates.choosing_lang)
        await cb.message.answer(t(lang, "register.ask.lang"), reply_markup=langs_kb(allowed))


@router.message(RegistrationStates.confirming)
async def confirming(message: Message, state: FSMContext, session: AsyncSession):
    text = (message.text or "").strip().lower()
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    if text not in ("yes", "ha", "да"):
        await state.clear()
        await message.answer("Cancelled / Bekor qilindi / Отменено", reply_markup=main_menu(lang))
        return
    data = await state.get_data()
    olympiad: Optional[Olympiad] = await session.get(Olympiad, data["olympiad_id"]) if data.get("olympiad_id") else None
    direction: Optional[Direction] = await session.get(Direction, data.get("direction_id")) if data.get("direction_id") else None
    group: Optional[GroupOption] = await session.get(GroupOption, data.get("group_option_id")) if data.get("group_option_id") else None

    # Ensure unique ticket id
    ticket_id = generate_ticket_id()
    while (await session.execute(select(Registration).where(Registration.ticket_id == ticket_id))).scalar_one_or_none():
        ticket_id = generate_ticket_id()

    reg = Registration(
        user_id=user.id,
        olympiad_id=olympiad.id if olympiad else None,
        direction_id=direction.id if direction else None,
        group_option_id=group.id if group else None,
        full_name=user.name or message.from_user.full_name,
        birth_date=data.get("birth_date", ""),
        region=data.get("region", ""),
        district=data.get("district", ""),
        school=data.get("school", ""),
        grade=str(data.get("grade")) if data.get("grade") else None,
        language=Lang[data.get("exam_lang", (user.language or Lang.UZ).value)],
        ticket_id=ticket_id,
    )
    session.add(reg)
    await session.flush()

    # Render ticket
    path = render_ticket(reg, olympiad, direction, group, reg.language)
    reg.ticket_image_path = path
    await session.commit()

    await push_registration(
        {
            "telegramId": str(message.from_user.id),
            "telegramUsername": f"@{message.from_user.username}" if message.from_user.username else None,
            "fullName": reg.full_name,
            "phone": user.phone or "",
            "olympiadTitle": olympiad.name if olympiad else None,
            "locale": (user.language or Lang.UZ).value.lower(),
            "meta": {
                "ticketId": reg.ticket_id,
                "region": reg.region,
                "district": reg.district,
                "school": reg.school,
                "grade": reg.grade,
                "direction": direction.name if direction else None,
                "group": group.name if group else None
            }
        }
    )

    caption = (
        f"{t(lang, 'ticket.ready')}\n"
        f"ID: {reg.ticket_id}\n"
        f"Sana: {olympiad.event_at.strftime('%Y-%m-%d %H:%M')}\n"
        f"Manzil: {olympiad.address}\n"
        f"Kech qolmang!"
    )
    try:
        await message.answer_photo(FSInputFile(path), caption=caption)
    except Exception:
        await message.answer(caption + f"\n(ticket: {path})")

    # Lead to group
    if config.group_chat_id:
        lead_text = (
            f"New registration\n"
            f"Olympiad: {olympiad.name}\n"
            f"User: {reg.full_name}\n"
            f"Phone: {user.phone}\n"
            f"Lang: {reg.language}\n"
            f"Region: {reg.region}, District: {reg.district}\n"
            f"School: {reg.school}, Grade: {reg.grade or '-'}\n"
            f"Direction: {direction.name if direction else '-'} / Group: {group.name if group else '-'}\n"
            f"Ticket: {reg.ticket_id}"
        )
        try:
            await message.bot.send_message(chat_id=config.group_chat_id, text=lead_text)
        except Exception:
            pass

    await state.clear()
    await message.answer(t(lang, "menu.title"), reply_markup=main_menu(lang))


@router.message(F.text.in_({"Biz haqimizda", "О нас", "About us"}))
async def about(message: Message, session: AsyncSession):
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    res = await session.execute(select(Olympiad))  # dummy to ensure session
    from app.models import About
    a = (await session.execute(select(About))).scalars().first()
    content = (a.content_uz if lang == Lang.UZ else a.content_ru if lang == Lang.RU else a.content_en) if a else None
    await message.answer(content or t(lang, "about.empty"))


@router.message(F.text.in_({"Bog'lanish", "Контакты", "Contact"}))
async def contact(message: Message, session: AsyncSession):
    # Simplify: show general contact phone = last active olympiad or placeholder
    res = await session.execute(select(Olympiad).where(Olympiad.is_active == True).order_by(Olympiad.created_at.desc()))
    o = res.scalars().first()
    phone = o.contact_phone if o else "+998 00 000 00 00"
    user = await get_or_create_user(session, message.from_user.id)
    lang = user.language or Lang.UZ
    await message.answer(t(lang, "contact.note", phone=phone))


# Admin panel in bot
async def _admin_set_view(obj: Message | CallbackQuery, state: FSMContext, text: str, reply_markup=None):
    """
    Simple dynamic admin view:
    - For callbacks: update the same message in-place.
    - For plain messages (/admin): send a fresh admin message.
    """
    if isinstance(obj, CallbackQuery):
        msg = obj.message
        try:
            await msg.edit_text(text, reply_markup=reply_markup)
        except Exception:
            # Fallback: only keyboard changes
            await msg.edit_reply_markup(reply_markup=reply_markup)
        return

    # Command message from user -> answer with new admin panel message
    await obj.answer(text, reply_markup=reply_markup)


async def show_admin_menu(msg_or_cb: Message | CallbackQuery, state: FSMContext):
    from app.bot.keyboards import admin_main_kb
    await _admin_set_view(msg_or_cb, state, "Admin panel", admin_main_kb())


async def show_admin_olymps(msg_or_cb: Message | CallbackQuery, state: FSMContext, session: AsyncSession):
    items = (await session.execute(select(Olympiad).order_by(Olympiad.created_at.desc()))).scalars().all()
    from app.bot.keyboards import admin_manage_olymps_kb
    text = "Olympiads" + (f" ({len(items)})" if items else " (none)")
    await _admin_set_view(msg_or_cb, state, text, admin_manage_olymps_kb(items))


async def show_admin_olymp_detail(msg_or_cb: Message | CallbackQuery, state: FSMContext, session: AsyncSession, oid: int):
    from app.bot.keyboards import admin_olymp_actions_kb, admin_directions_kb
    o = await session.get(Olympiad, oid)
    if not o:
        await _admin_set_view(msg_or_cb, state, "Not found", None)
        return
    text = f"{o.name}\nActive: {o.is_active}\nDate: {o.event_at}\nPhone: {o.contact_phone}"
    dirs = (await session.execute(select(Direction).where(Direction.olympiad_id == oid))).scalars().all()
    kb = admin_olymp_actions_kb(o.id, o.is_active)
    # When directions exist, show a separate keyboard for them via edit? We replace markup with actions; directions accessible via button
    await _admin_set_view(msg_or_cb, state, text, kb)
    if dirs:
        # Update to directions view when requested, not here
        pass


async def show_admin_direction_detail(msg_or_cb: Message | CallbackQuery, state: FSMContext, session: AsyncSession, did: int):
    from app.bot.keyboards import admin_dir_actions_kb, admin_groups_manage_kb
    d = await session.get(Direction, did)
    if not d:
        await _admin_set_view(msg_or_cb, state, "Not found", None)
        return
    groups = (await session.execute(select(GroupOption).where(GroupOption.direction_id == did).order_by(GroupOption.order))).scalars().all()
    names = ", ".join(g.name for g in groups) if groups else "(none)"
    text = f"Direction: {d.name} ({d.grouping})\nGroups: {names}"
    # Merge actions with group management buttons
    actions = admin_dir_actions_kb(did, d.olympiad_id).inline_keyboard
    group_rows = admin_groups_manage_kb(groups, d.olympiad_id).inline_keyboard if groups else []
    from aiogram.types import InlineKeyboardMarkup
    await _admin_set_view(
        msg_or_cb,
        state,
        text,
        InlineKeyboardMarkup(inline_keyboard=actions + group_rows),
    )



@router.callback_query(AdminStates.main, F.data == "adm:main")
async def adm_back_main(cb: CallbackQuery, state: FSMContext):
    await state.set_state(AdminStates.main)
    await show_admin_menu(cb, state)


@router.callback_query(AdminStates.main, F.data == "adm:exit")
async def adm_exit(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    user = await get_or_create_user(session, cb.from_user.id)
    lang = user.language or Lang.UZ
    try:
        await cb.message.edit_reply_markup(reply_markup=None)
    except Exception:
        pass
    await state.clear()
    await cb.message.answer(t(lang, "menu.title"), reply_markup=main_menu(lang))


@router.callback_query(AdminStates.main, F.data == "adm:list")
async def adm_list(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    await show_admin_olymps(cb, state, session)


@router.callback_query(AdminStates.main, F.data == "adm:new")
async def adm_new(cb: CallbackQuery, state: FSMContext):
    await state.set_state(AdminStates.new_olymp_name)
    await _admin_set_view(cb, state, "Olympiad name:")


@router.message(AdminStates.new_olymp_name)
async def adm_new_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text.strip())
    await state.set_state(AdminStates.new_olymp_desc)
    await _admin_set_view(message, state, "Description (optional):")


@router.message(AdminStates.new_olymp_desc)
async def adm_new_desc(message: Message, state: FSMContext):
    await state.update_data(description=message.text or "")
    await state.set_state(AdminStates.new_olymp_poster)
    await _admin_set_view(message, state, "Send poster image or type 'skip'")


@router.message(AdminStates.new_olymp_poster)
async def adm_new_poster(message: Message, state: FSMContext):
    from pathlib import Path
    path = None
    if message.photo:
        p = message.photo[-1]
        file = await message.bot.get_file(p.file_id)
        dest = Path("storage/uploads")
        dest.mkdir(parents=True, exist_ok=True)
        out = dest / f"poster_{file.file_unique_id}.jpg"
        await message.bot.download_file(file.file_path, out)
        path = str(out)
    elif (message.text or "").strip().lower() == "skip":
        path = None
    else:
        await _admin_set_view(message, state, "Please send a photo or type 'skip'")
        return
    await state.update_data(poster_path=path)
    await state.set_state(AdminStates.new_olymp_pdf)
    await _admin_set_view(message, state, "Send PDF file or type 'skip'")


@router.message(AdminStates.new_olymp_pdf)
async def adm_new_pdf(message: Message, state: FSMContext):
    from pathlib import Path
    path = None
    if message.document and (message.document.file_name or '').lower().endswith('.pdf'):
        file = await message.bot.get_file(message.document.file_id)
        dest = Path("storage/uploads")
        dest.mkdir(parents=True, exist_ok=True)
        out = dest / f"pdf_{file.file_unique_id}.pdf"
        await message.bot.download_file(file.file_path, out)
        path = str(out)
    elif (message.text or "").strip().lower() == "skip":
        path = None
    else:
        await _admin_set_view(message, state, "Please send a PDF or type 'skip'")
        return
    await state.update_data(pdf_path=path)
    await state.set_state(AdminStates.new_olymp_datetime)
    await _admin_set_view(message, state, "Event time (YYYY-MM-DD HH:MM):")


@router.message(AdminStates.new_olymp_datetime)
async def adm_new_dt(message: Message, state: FSMContext):
    txt = (message.text or '').strip().replace('T', ' ')
    try:
        dt = datetime.strptime(txt, "%Y-%m-%d %H:%M")
    except Exception:
        await _admin_set_view(message, state, "Format: YYYY-MM-DD HH:MM")
        return
    await state.update_data(event_at=dt.isoformat())
    await state.set_state(AdminStates.new_olymp_address)
    await _admin_set_view(message, state, "Address:")


@router.message(AdminStates.new_olymp_address)
async def adm_new_addr(message: Message, state: FSMContext):
    await state.update_data(address=message.text.strip())
    await state.set_state(AdminStates.new_olymp_phone)
    await _admin_set_view(message, state, "Contact phone:")


@router.message(AdminStates.new_olymp_phone)
async def adm_new_phone(message: Message, state: FSMContext):
    await state.update_data(contact_phone=message.text.strip())
    await state.set_state(AdminStates.new_olymp_langs)
    from app.bot.keyboards import admin_langs_toggle_kb
    await state.update_data(langs=list(["UZ"]))
    await _admin_set_view(message, state, "Select languages, then press Done.", reply_markup=admin_langs_toggle_kb(set(["UZ"])) )


@router.callback_query(AdminStates.new_olymp_langs, F.data.startswith("adm:lang:"))
async def adm_new_langs(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    from app.bot.keyboards import admin_langs_toggle_kb
    code = cb.data.split(":")[2]
    data = await state.get_data()
    sel: set[str] = set(data.get("langs", []))
    if code == "done":
        d = await state.get_data()
        name = d["name"]; desc = d.get("description", ""); poster = d.get("poster_path"); pdf = d.get("pdf_path")
        dt = datetime.fromisoformat(d["event_at"]) 
        addr = d["address"]; phone = d["contact_phone"]
        lang_uz = "UZ" in sel; lang_ru = "RU" in sel; lang_en = "EN" in sel
        o = Olympiad(
            name=name, description=desc, poster_path=poster, pdf_path=pdf,
            event_at=dt, address=addr, contact_phone=phone,
            lang_uz=lang_uz, lang_ru=lang_ru, lang_en=lang_en, is_active=True,
        )
        session.add(o)
        await session.commit()
        await state.set_state(AdminStates.main)
        await _admin_set_view(cb, state, "Olympiad created.")
        await show_admin_olymps(cb, state, session)
        return
    if code in {"UZ","RU","EN"}:
        if code in sel:
            sel.remove(code)
        else:
            sel.add(code)
        await state.update_data(langs=list(sel))
    await cb.message.edit_reply_markup(reply_markup=admin_langs_toggle_kb(sel))


@router.callback_query(AdminStates.main, F.data == "adm:broadcast")
async def adm_broadcast(cb: CallbackQuery, state: FSMContext):
    await _admin_set_view(cb, state, "Send broadcast text. Optionally attach photo/video in the same message.")
    await state.update_data(broadcast_pending=True)


@router.message(AdminStates.main, F.photo | F.video | F.text)
async def adm_broadcast_send(message: Message, state: FSMContext, session: AsyncSession):
    data = await state.get_data()
    if not data.get("broadcast_pending"):
        return
    text = message.caption or message.text or ""
    users = (await session.execute(select(User))).scalars().all()
    for u in users:
        try:
            if message.photo:
                await message.bot.send_photo(u.tg_user_id, message.photo[-1].file_id, caption=text or None)
            elif message.video:
                await message.bot.send_video(u.tg_user_id, message.video.file_id, caption=text or None)
            else:
                await message.bot.send_message(u.tg_user_id, text)
        except Exception:
            continue
    await state.update_data(broadcast_pending=False)
    await _admin_set_view(message, state, "Broadcast sent.")
    await show_admin_menu(message, state)


@router.callback_query(AdminStates.main, F.data == "adm:geo:import")
async def adm_geo_import(cb: CallbackQuery, state: FSMContext):
    await state.set_state(AdminStates.geo_import_waiting)
    await _admin_set_view(cb, state, "Send JSON or Excel (.xlsx) file with Region/District data. For Excel use two columns: Region, District (with header).")


@router.message(AdminStates.geo_import_waiting, F.document)
async def adm_geo_import_file(message: Message, state: FSMContext):
    from pathlib import Path
    from app.geo import save_geodata, parse_geo_excel
    import json
    doc = message.document
    file = await message.bot.get_file(doc.file_id)
    dest_dir = Path("storage/uploads"); dest_dir.mkdir(parents=True, exist_ok=True)
    local = dest_dir / f"geo_{file.file_unique_id}_{doc.file_name}"
    await message.bot.download_file(file.file_path, local)
    try:
        if str(local).lower().endswith(".json"):
            data = json.loads(local.read_text(encoding="utf-8"))
            regions = data.get("regions") or []
            districts = data.get("districts") or {}
            if not isinstance(regions, list) or not isinstance(districts, dict):
                raise ValueError("Invalid JSON schema")
            save_geodata(regions, districts)
        elif str(local).lower().endswith(".xlsx"):
            regions, districts = parse_geo_excel(local)
            save_geodata(regions, districts)
        else:
            await _admin_set_view(message, state, "Unsupported file type. Send .json or .xlsx")
            return
        await state.set_state(AdminStates.main)
        await _admin_set_view(message, state, "Geo data imported.")
        await show_admin_menu(message, state)
    except Exception as e:
        await _admin_set_view(message, state, f"Failed to import: {e}")
@router.callback_query(AdminStates.main, F.data == "adm:export_users")
async def adm_export_users(cb: CallbackQuery, session: AsyncSession):
    import openpyxl, io
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Users"
    ws.append(["ID","TG_ID","Role","Name","Phone","Language","Created At"])
    for u in (await session.execute(select(User))).scalars().all():
        ws.append([u.id, u.tg_user_id, u.role or "", u.name or "", u.phone or "", u.language or "", u.created_at])
    buf = io.BytesIO(); wb.save(buf); data = buf.getvalue()
    file = BufferedInputFile(data, filename="users.xlsx")
    await cb.message.answer_document(document=file)


@router.callback_query(AdminStates.main, F.data.startswith("adm:ol:"))
async def adm_open_ol(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    oid = int(cb.data.split(":")[2])
    await show_admin_olymp_detail(cb, state, session, oid)


@router.callback_query(AdminStates.main, F.data.startswith("adm:toggle:"))
async def adm_toggle(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    oid = int(cb.data.split(":")[2])
    o = await session.get(Olympiad, oid)
    if not o: return
    o.is_active = not o.is_active
    await session.commit()
    await cb.answer("Toggled")
    await show_admin_olymp_detail(cb, state, session, oid)


@router.callback_query(AdminStates.main, F.data.startswith("adm:del:"))
async def adm_delete(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    oid = int(cb.data.split(":")[2])
    o = await session.get(Olympiad, oid)
    if not o: return
    await session.delete(o); await session.commit()
    await cb.answer("Deleted")
    await show_admin_olymps(cb, state, session)


@router.callback_query(AdminStates.main, F.data.startswith("adm:export:"))
async def adm_export_regs(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    import openpyxl, io
    oid = int(cb.data.split(":")[2])
    regs = (await session.execute(select(Registration).where(Registration.olympiad_id == oid))).scalars().all()
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Registrations"
    ws.append(["ID","Ticket","Name","Phone","Lang","Region","District","School","Grade","Direction","Group","Created"]) 
    for r in regs:
        user = await session.get(User, r.user_id)
        direction = await session.get(Direction, r.direction_id) if r.direction_id else None
        group = await session.get(GroupOption, r.group_option_id) if r.group_option_id else None
        ws.append([r.id, r.ticket_id, r.full_name, user.phone if user else "", r.language, r.region, r.district, r.school, r.grade or "", direction.name if direction else "", group.name if group else "", r.created_at])
    buf = io.BytesIO(); wb.save(buf); data = buf.getvalue()
    file = BufferedInputFile(data, filename=f"registrations_{oid}.xlsx")
    await cb.message.answer_document(document=file)


@router.callback_query(AdminStates.main, F.data.startswith("adm:diradd:"))
async def adm_dir_add(cb: CallbackQuery, state: FSMContext):
    oid = int(cb.data.split(":")[2])
    await state.update_data(oid=oid)
    await state.set_state(AdminStates.add_dir_name)
    await _admin_set_view(cb, state, "Direction name:")


@router.callback_query(AdminStates.main, F.data.startswith("adm:dirs:"))
async def adm_dirs(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    oid = int(cb.data.split(":")[2])
    dirs = (await session.execute(select(Direction).where(Direction.olympiad_id == oid))).scalars().all()
    from app.bot.keyboards import admin_directions_kb
    await _admin_set_view(cb, state, f"Directions ({len(dirs)})", reply_markup=admin_directions_kb(dirs, oid))


@router.callback_query(AdminStates.main, F.data.startswith("adm:dir:"))
async def adm_dir_detail(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    did = int(cb.data.split(":")[2])
    await show_admin_direction_detail(cb, state, session, did)


@router.callback_query(AdminStates.main, F.data.startswith("adm:dirgadd:"))
async def adm_dir_add_groups(cb: CallbackQuery, state: FSMContext):
    did = int(cb.data.split(":")[2])
    await state.update_data(add_groups_did=did)
    await state.set_state(AdminStates.add_groups_to_direction)
    await _admin_set_view(cb, state, "Enter groups (comma separated):")


@router.callback_query(AdminStates.main, F.data.startswith("adm:dirren:"))
async def adm_dir_rename(cb: CallbackQuery, state: FSMContext):
    did = int(cb.data.split(":")[2])
    await state.update_data(rename_dir_id=did)
    await state.set_state(AdminStates.rename_dir_waiting_name)
    await _admin_set_view(cb, state, "New direction name:")


@router.message(AdminStates.rename_dir_waiting_name)
async def adm_dir_rename_submit(message: Message, state: FSMContext, session: AsyncSession):
    from app.models import Direction
    did = (await state.get_data()).get("rename_dir_id")
    d = await session.get(Direction, did)
    if not d:
        await _admin_set_view(message, state, "Not found")
        return
    d.name = message.text.strip()
    await session.commit()
    await state.set_state(AdminStates.main)
    await _admin_set_view(message, state, "Direction renamed.")
    await show_admin_direction_detail(message, state, session, did)


@router.callback_query(AdminStates.main, F.data.startswith("adm:dirdel:"))
async def adm_dir_delete(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    from app.models import Direction
    did = int(cb.data.split(":")[2])
    d = await session.get(Direction, did)
    if not d:
        await cb.answer("Not found")
        return
    oid = d.olympiad_id
    await session.delete(d)
    await session.commit()
    await cb.answer("Deleted")
    await show_admin_olymp_detail(cb, state, session, oid)


@router.callback_query(AdminStates.main, F.data.startswith("adm:gren:"))
async def adm_group_rename(cb: CallbackQuery, state: FSMContext):
    gid = int(cb.data.split(":")[2])
    await state.update_data(rename_group_id=gid)
    await state.set_state(AdminStates.rename_group_waiting_name)
    await _admin_set_view(cb, state, "New group name:")


@router.message(AdminStates.rename_group_waiting_name)
async def adm_group_rename_submit(message: Message, state: FSMContext, session: AsyncSession):
    from app.models import GroupOption
    gid = (await state.get_data()).get("rename_group_id")
    g = await session.get(GroupOption, gid)
    if not g:
        await _admin_set_view(message, state, "Not found")
        return
    g.name = message.text.strip()
    await session.commit()
    await state.set_state(AdminStates.main)
    await _admin_set_view(message, state, "Group renamed.")
    await show_admin_direction_detail(message, state, session, g.direction_id)


@router.callback_query(AdminStates.main, F.data.startswith("adm:gdel:"))
async def adm_group_delete(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    from app.models import GroupOption
    gid = int(cb.data.split(":")[2])
    g = await session.get(GroupOption, gid)
    if not g:
        await cb.answer("Not found")
        return
    did = g.direction_id
    await session.delete(g)
    await session.commit()
    await cb.answer("Deleted")
    await show_admin_direction_detail(cb, state, session, did)


@router.message(AdminStates.add_groups_to_direction)
async def adm_dir_groups_add_submit(message: Message, state: FSMContext, session: AsyncSession):
    did = (await state.get_data()).get('add_groups_did')
    if not did:
        await _admin_set_view(message, state, "No direction context")
        return
    names = [x.strip() for x in (message.text or '').split(',') if x.strip()]
    res = await session.execute(select(GroupOption).where(GroupOption.direction_id == did).order_by(GroupOption.order.desc()))
    last = res.scalars().first()
    start = (last.order + 1) if last else 0
    for idx, nm in enumerate(names):
        session.add(GroupOption(direction_id=did, name=nm, order=start + idx))
    await session.commit()
    await state.set_state(AdminStates.main)
    await _admin_set_view(message, state, "Groups added.")
    await show_admin_direction_detail(message, state, session, did)


@router.message(AdminStates.add_dir_name)
async def adm_dir_name(message: Message, state: FSMContext):
    await state.update_data(dir_name=message.text.strip())
    from app.bot.keyboards import admin_grouping_kb
    await state.set_state(AdminStates.add_dir_grouping)
    await _admin_set_view(message, state, "Grouping:", reply_markup=admin_grouping_kb())


@router.callback_query(AdminStates.add_dir_grouping, F.data.startswith("adm:grp:"))
async def adm_dir_grouping(cb: CallbackQuery, state: FSMContext, session: AsyncSession):
    grp = cb.data.split(":")[2]
    await state.update_data(grouping=grp)
    if grp == "LEVEL":
        await state.set_state(AdminStates.add_dir_groups)
        await _admin_set_view(cb, state, "Enter groups (comma separated):")
    else:
        from app.models import Direction, Grouping
        data = await state.get_data()
        d = Direction(olympiad_id=data["oid"], name=data["dir_name"], grouping=Grouping.CLASS)
        session.add(d)
        await session.commit()
        await state.set_state(AdminStates.main)
        await _admin_set_view(cb, state, "Direction added (CLASS).")
        await show_admin_olymp_detail(cb, state, session, data["oid"])


@router.message(AdminStates.add_dir_groups)
async def adm_dir_groups(message: Message, state: FSMContext, session: AsyncSession):
    from app.models import Direction, Grouping, GroupOption
    data = await state.get_data()
    d = Direction(olympiad_id=data["oid"], name=data["dir_name"], grouping=Grouping.LEVEL)
    session.add(d); await session.flush()
    names = [x.strip() for x in (message.text or '').split(',') if x.strip()]
    for idx, nm in enumerate(names):
        session.add(GroupOption(direction_id=d.id, name=nm, order=idx))
    await session.commit()
    await state.set_state(AdminStates.main)
    await _admin_set_view(message, state, "Direction with groups added.")
    await show_admin_direction_detail(message, state, session, d.id)


@router.message(Command("admin"))
async def admin_cmd(message: Message, state: FSMContext):
    if message.from_user.id not in config.admin_ids:
        await message.answer("Not authorized")
        return
    await state.clear()
    await state.set_state(AdminStates.main)
    await show_admin_menu(message, state)



