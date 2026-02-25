from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from app.models import Lang
from app.geo import get_regions, get_districts


def lang_keyboard() -> InlineKeyboardMarkup:
    kb = [
        [InlineKeyboardButton(text="UZ", callback_data="lang:UZ"),
         InlineKeyboardButton(text="RU", callback_data="lang:RU"),
         InlineKeyboardButton(text="EN", callback_data="lang:EN")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=kb)


def role_keyboard(lang: Lang) -> InlineKeyboardMarkup:
    labels = {
        Lang.UZ: ("O'quvchi", "Ota-ona", "O'qituvchi"),
        Lang.RU: ("Ученик", "Родитель", "Учитель"),
        Lang.EN: ("Student", "Parent", "Teacher"),
    }
    a, b, c = labels[lang]
    kb = [
        [InlineKeyboardButton(text=a, callback_data="role:STUDENT")],
        [InlineKeyboardButton(text=b, callback_data="role:PARENT")],
        [InlineKeyboardButton(text=c, callback_data="role:TEACHER")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=kb)


def contact_keyboard(btn_text: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=btn_text, request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
        selective=True,
    )


def main_menu(lang: Lang) -> ReplyKeyboardMarkup:
    labels = {
        Lang.UZ: ("Olimpiadalar", "Biz haqimizda", "Bog'lanish"),
        Lang.RU: ("Олимпиады", "О нас", "Контакты"),
        Lang.EN: ("Olympiads", "About us", "Contact"),
    }
    a, b, c = labels[lang]
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=a)], [KeyboardButton(text=b)], [KeyboardButton(text=c)]],
        resize_keyboard=True,
    )


def register_button(lang: Lang) -> InlineKeyboardMarkup:
    labels = {Lang.UZ: "Ro'yxatdan o'tish", Lang.RU: "Регистрация", Lang.EN: "Register"}
    kb = [[InlineKeyboardButton(text=labels[lang], callback_data="olymp:register")]]
    return InlineKeyboardMarkup(inline_keyboard=kb)


def olympiad_list_kb(items: list, lang: Lang) -> InlineKeyboardMarkup:
    rows = []
    for o in items:
        rows.append([InlineKeyboardButton(text=f"{o.name}", callback_data=f"ol:open:{o.id}")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def olympiad_register_btn(lang: Lang, oid: int) -> InlineKeyboardMarkup:
    labels = {Lang.UZ: "Ro'yxatdan o'tish", Lang.RU: "Регистрация", Lang.EN: "Register"}
    return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=labels[lang], callback_data=f"ol:reg:{oid}")]])


def directions_kb(directions: list) -> InlineKeyboardMarkup:
    rows = []
    for d in directions:
        rows.append([InlineKeyboardButton(text=f"{d.name}", callback_data=f"dir:{d.id}")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def groups_kb(groups: list) -> InlineKeyboardMarkup:
    rows = []
    for g in groups:
        rows.append([InlineKeyboardButton(text=f"{g.name}", callback_data=f"grp:{g.id}")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def grades_kb() -> InlineKeyboardMarkup:
    rows = []
    # 1..11 in rows of up to 4
    tmp = []
    for i in range(1, 12):
        tmp.append(InlineKeyboardButton(text=str(i), callback_data=f"grade:{i}"))
        if len(tmp) == 4:
            rows.append(tmp)
            tmp = []
    if tmp:
        rows.append(tmp)
    return InlineKeyboardMarkup(inline_keyboard=rows)


def langs_kb(allowed: list[str]) -> InlineKeyboardMarkup:
    rows = [[InlineKeyboardButton(text=code, callback_data=f"elang:{code}") for code in allowed]]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def regions_kb() -> InlineKeyboardMarkup:
    rows = []
    tmp = []
    for name in get_regions():
        tmp.append(InlineKeyboardButton(text=name, callback_data=f"reg:{name}"))
        if len(tmp) == 2:
            rows.append(tmp); tmp = []
    if tmp:
        rows.append(tmp)
    # Add Other
    rows.append([InlineKeyboardButton(text="Boshqa", callback_data="reg:__other__")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def districts_kb(region: str) -> InlineKeyboardMarkup:
    items = get_districts(region)
    rows = []
    tmp = []
    for name in items:
        tmp.append(InlineKeyboardButton(text=name, callback_data=f"dist:{name}"))
        if len(tmp) == 2:
            rows.append(tmp); tmp = []
    if tmp:
        rows.append(tmp)
    rows.append([InlineKeyboardButton(text="Boshqa", callback_data="dist:__other__")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def confirm_kb(lang: Lang) -> InlineKeyboardMarkup:
    labels_yes = {Lang.UZ: "Tasdiqlash", Lang.RU: "Подтвердить", Lang.EN: "Confirm"}
    labels_no = {Lang.UZ: "Bekor qilish", Lang.RU: "Отмена", Lang.EN: "Cancel"}
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=labels_yes[lang], callback_data="confirm:yes")],
        [InlineKeyboardButton(text=labels_no[lang], callback_data="confirm:no")],
    ])


def confirm_with_edit_kb(lang: Lang) -> InlineKeyboardMarkup:
    labels_yes = {Lang.UZ: "Tasdiqlash", Lang.RU: "Подтвердить", Lang.EN: "Confirm"}
    labels_no = {Lang.UZ: "Bekor qilish", Lang.RU: "Отмена", Lang.EN: "Cancel"}
    label_edit = {Lang.UZ: "Tahrirlash", Lang.RU: "Редактировать", Lang.EN: "Edit"}
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=labels_yes[lang], callback_data="confirm:yes")],
        [InlineKeyboardButton(text=label_edit[lang], callback_data="confirm:edit")],
        [InlineKeyboardButton(text=labels_no[lang], callback_data="confirm:no")],
    ])


def edit_menu_kb() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text="✏️ Ism", callback_data="edit:fullname"), InlineKeyboardButton(text="✏️ Telefon", callback_data="edit:phone")],
        [InlineKeyboardButton(text="✏️ Tug'ilgan sana", callback_data="edit:birth")],
        [InlineKeyboardButton(text="✏️ Hudud", callback_data="edit:region"), InlineKeyboardButton(text="✏️ Tuman", callback_data="edit:district")],
        [InlineKeyboardButton(text="✏️ Maktab", callback_data="edit:school")],
        [InlineKeyboardButton(text="✏️ Sinf/Daraja", callback_data="edit:level")],
        [InlineKeyboardButton(text="✏️ Til", callback_data="edit:lang")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


# Admin keyboards
def admin_main_kb() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text="➕ New Olympiad", callback_data="adm:new")],
        [InlineKeyboardButton(text="📋 Manage Olympiads", callback_data="adm:list")],
        [InlineKeyboardButton(text="📤 Broadcast", callback_data="adm:broadcast")],
        [InlineKeyboardButton(text="🧾 Export Users", callback_data="adm:export_users")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_manage_olymps_kb(items: list) -> InlineKeyboardMarkup:
    rows = []
    for o in items:
        rows.append([InlineKeyboardButton(text=f"{o.name}", callback_data=f"adm:ol:{o.id}")])
    # Navigation: back to admin main or exit
    rows.append([InlineKeyboardButton(text="Back", callback_data="adm:main")])
    rows.append([InlineKeyboardButton(text="Exit admin", callback_data="adm:exit")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_olymp_actions_kb(oid: int, is_active: bool) -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text="📂 Directions", callback_data=f"adm:dirs:{oid}")],
        [InlineKeyboardButton(text="➕ Add Direction", callback_data=f"adm:diradd:{oid}")],
        [InlineKeyboardButton(text=("🔴 Deactivate" if is_active else "🟢 Activate"), callback_data=f"adm:toggle:{oid}")],
        [InlineKeyboardButton(text="🗑 Delete", callback_data=f"adm:del:{oid}")],
        [InlineKeyboardButton(text="🧾 Export Registrations", callback_data=f"adm:export:{oid}")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_directions_kb(directions: list) -> InlineKeyboardMarkup:
    rows = []
    for d in directions:
        rows.append([InlineKeyboardButton(text=f"{d.name} ({d.grouping})", callback_data=f"adm:dir:{d.id}")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_dir_actions_kb(did: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✏️ Rename Direction", callback_data=f"adm:dirren:{did}")],
        [InlineKeyboardButton(text="🗑 Delete Direction", callback_data=f"adm:dirdel:{did}")],
        [InlineKeyboardButton(text="➕ Add Groups", callback_data=f"adm:dirgadd:{did}")],
    ])


def admin_groups_manage_kb(groups: list) -> InlineKeyboardMarkup:
    rows = []
    for g in groups:
        rows.append([
            InlineKeyboardButton(text=f"✏️ {g.name}", callback_data=f"adm:gren:{g.id}"),
            InlineKeyboardButton(text="🗑", callback_data=f"adm:gdel:{g.id}"),
        ])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_main_kb() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text="➕ New Olympiad", callback_data="adm:new")],
        [InlineKeyboardButton(text="📋 Manage Olympiads", callback_data="adm:list")],
        [InlineKeyboardButton(text="📤 Broadcast", callback_data="adm:broadcast")],
        [InlineKeyboardButton(text="🧾 Export Users", callback_data="adm:export_users")],
        [InlineKeyboardButton(text="🌍 Import Geo", callback_data="adm:geo:import")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def review_kb(lang: Lang) -> InlineKeyboardMarkup:
    labels_confirm = {Lang.UZ: "Tasdiqlash", Lang.RU: "Подтвердить", Lang.EN: "Confirm"}
    labels_cancel = {Lang.UZ: "Bekor qilish", Lang.RU: "Отмена", Lang.EN: "Cancel"}
    rows = [
        [InlineKeyboardButton(text="✏️ Ism", callback_data="edit:fullname"), InlineKeyboardButton(text="✏️ Telefon", callback_data="edit:phone")],
        [InlineKeyboardButton(text="✏️ Tug'ilgan sana", callback_data="edit:birth")],
        [InlineKeyboardButton(text="✏️ Hudud", callback_data="edit:region"), InlineKeyboardButton(text="✏️ Tuman", callback_data="edit:district")],
        [InlineKeyboardButton(text="✏️ Maktab", callback_data="edit:school")],
        [InlineKeyboardButton(text="✏️ Sinf/Daraja", callback_data="edit:level")],
        [InlineKeyboardButton(text="✏️ Til", callback_data="edit:lang")],
        [InlineKeyboardButton(text=labels_confirm[lang], callback_data="confirm:yes"), InlineKeyboardButton(text=labels_cancel[lang], callback_data="confirm:no")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_grouping_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="CLASS (1-11)", callback_data="adm:grp:CLASS")],
        [InlineKeyboardButton(text="LEVEL (custom)", callback_data="adm:grp:LEVEL")],
    ])


def admin_langs_toggle_kb(selected: set[str]) -> InlineKeyboardMarkup:
    def label(code: str) -> str:
        return ("✅ " if code in selected else "⬜ ") + code
    rows = [[
        InlineKeyboardButton(text=label("UZ"), callback_data="adm:lang:UZ"),
        InlineKeyboardButton(text=label("RU"), callback_data="adm:lang:RU"),
        InlineKeyboardButton(text=label("EN"), callback_data="adm:lang:EN"),
    ], [InlineKeyboardButton(text="Done", callback_data="adm:lang:done")]]
    return InlineKeyboardMarkup(inline_keyboard=rows)
