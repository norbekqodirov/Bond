from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request, Depends, Form, UploadFile, File
from fastapi.responses import RedirectResponse, HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from itsdangerous import URLSafeTimedSerializer, BadSignature
from functools import wraps
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import config
from app.db import get_session
from app.models import Olympiad, Direction, Grouping, GroupOption, Registration, User, About, Lang
from app.ticket import TICKETS_DIR
from app.broker import get_bot


BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR.parent / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


templates = Jinja2Templates(directory=str(BASE_DIR / "web" / "templates"))
app = FastAPI()

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "web" / "static")), name="static")

serializer = URLSafeTimedSerializer("bond-secret")


def login_required(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request | None = kwargs.get("request")
        if request is None and args:
            # assume first arg is Request (FastAPI passes by name, but be safe)
            request = next((a for a in args if isinstance(a, Request)), None)
        if request is None:
            return RedirectResponse("/admin/login", status_code=302)
        token = request.cookies.get("session")
        if not token:
            return RedirectResponse("/admin/login", status_code=302)
        try:
            data = serializer.loads(token, max_age=86400)
            if data.get("u") != config.admin_username:
                raise BadSignature()
        except Exception:
            return RedirectResponse("/admin/login", status_code=302)
        return await func(*args, **kwargs)
    return wrapper


@app.get("/")
async def root():
    return RedirectResponse("/admin", status_code=302)


@app.get("/admin/login")
async def admin_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request, "error": None})


@app.post("/admin/login")
async def admin_login_post(request: Request, username: str = Form(...), password: str = Form(...)):
    if username == config.admin_username and password == config.admin_password:
        token = serializer.dumps({"u": username})
        resp = RedirectResponse("/admin", status_code=302)
        resp.set_cookie("session", token, httponly=True)
        return resp
    return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid"})


@app.get("/admin")
@login_required
async def admin_home(request: Request, session: AsyncSession = Depends(get_session)):
    total_users = (await session.execute(select(User))).scalars().all()
    total_regs = (await session.execute(select(Registration))).scalars().all()
    total_olymp = (await session.execute(select(Olympiad))).scalars().all()
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "counts": {
                "users": len(total_users),
                "registrations": len(total_regs),
                "olympiads": len(total_olymp),
            },
        },
    )


@app.get("/admin/olympiads")
@login_required
async def list_olympiads(request: Request, session: AsyncSession = Depends(get_session)):
    items = (await session.execute(select(Olympiad).order_by(Olympiad.created_at.desc()))).scalars().all()
    return templates.TemplateResponse("olympiads.html", {"request": request, "items": items})


@app.get("/admin/olympiads/new")
@login_required
async def new_olympiad(request: Request):
    return templates.TemplateResponse("olympiad_new.html", {"request": request})


@app.post("/admin/olympiads/new")
@login_required
async def create_olympiad(
    request: Request,
    name: str = Form(...),
    description: str = Form(""),
    event_at: str = Form(...),
    address: str = Form(...),
    contact_phone: str = Form(""),
    fee: int = Form(0),
    lang_uz: bool = Form(False),
    lang_ru: bool = Form(False),
    lang_en: bool = Form(False),
    poster: Optional[UploadFile] = File(None),
    pdf: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
):
    poster_path = None
    pdf_path = None
    if poster and poster.filename:
        p = UPLOADS_DIR / f"poster_{int(datetime.utcnow().timestamp())}_{poster.filename}"
        with open(p, "wb") as f:
            f.write(await poster.read())
        poster_path = str(p)
    if pdf and pdf.filename:
        p = UPLOADS_DIR / f"pdf_{int(datetime.utcnow().timestamp())}_{pdf.filename}"
        with open(p, "wb") as f:
            f.write(await pdf.read())
        pdf_path = str(p)

    dt = datetime.fromisoformat(event_at)
    o = Olympiad(
        name=name,
        description=description,
        event_at=dt,
        address=address,
        contact_phone=contact_phone,
        fee=int(fee or 0),
        poster_path=poster_path,
        pdf_path=pdf_path,
        lang_uz=bool(lang_uz),
        lang_ru=bool(lang_ru),
        lang_en=bool(lang_en),
        is_active=True,
    )
    session.add(o)
    await session.commit()
    return RedirectResponse("/admin/olympiads", status_code=302)


@app.get("/admin/olympiads/{oid}")
@login_required
async def olympiad_detail(request: Request, oid: int, session: AsyncSession = Depends(get_session)):
    o = await session.get(Olympiad, oid)
    if not o:
        return HTMLResponse("Not found", status_code=404)
    dirs = (await session.execute(select(Direction).where(Direction.olympiad_id == oid))).scalars().all()
    # Build groups map for template
    groups_map = {}
    for d in dirs:
        groups = (await session.execute(select(GroupOption).where(GroupOption.direction_id == d.id).order_by(GroupOption.order))).scalars().all()
        groups_map[d.id] = groups
    regs = (await session.execute(select(Registration).where(Registration.olympiad_id == oid))).scalars().all()
    return templates.TemplateResponse("olympiad_detail.html", {"request": request, "o": o, "dirs": dirs, "groups_map": groups_map, "regs": regs})


@app.post("/admin/olympiads/{oid}/toggle")
@login_required
async def toggle_olympiad(request: Request, oid: int, session: AsyncSession = Depends(get_session)):
    o = await session.get(Olympiad, oid)
    if not o:
        return HTMLResponse("Not found", status_code=404)
    o.is_active = not o.is_active
    await session.commit()
    return RedirectResponse(f"/admin/olympiads/{oid}", status_code=302)


@app.post("/admin/olympiads/{oid}/fee")
@login_required
async def update_fee(request: Request, oid: int, fee: int = Form(0), session: AsyncSession = Depends(get_session)):
    o = await session.get(Olympiad, oid)
    if not o:
        return HTMLResponse("Not found", status_code=404)
    o.fee = int(fee or 0)
    await session.commit()
    return RedirectResponse(f"/admin/olympiads/{oid}", status_code=302)


@app.post("/admin/olympiads/{oid}/delete")
@login_required
async def delete_olympiad(request: Request, oid: int, session: AsyncSession = Depends(get_session)):
    o = await session.get(Olympiad, oid)
    if not o:
        return HTMLResponse("Not found", status_code=404)
    await session.delete(o)
    await session.commit()
    return RedirectResponse("/admin/olympiads", status_code=302)


@app.post("/admin/olympiads/{oid}/directions/new")
@login_required
async def add_direction(
    request: Request,
    oid: int,
    name: str = Form(...),
    grouping: str = Form(...),
    groups: str = Form(""),  # comma-separated names when LEVEL
    session: AsyncSession = Depends(get_session),
):
    o = await session.get(Olympiad, oid)
    if not o:
        return HTMLResponse("Not found", status_code=404)
    g = Grouping[grouping]
    d = Direction(olympiad_id=oid, name=name, grouping=g)
    session.add(d)
    await session.flush()
    if g == Grouping.LEVEL and groups:
        for idx, nm in enumerate([x.strip() for x in groups.split(",") if x.strip()]):
            session.add(GroupOption(direction_id=d.id, name=nm, order=idx))
    await session.commit()
    return RedirectResponse(f"/admin/olympiads/{oid}", status_code=302)


@app.get("/admin/users/export")
@login_required
async def export_users(request: Request, session: AsyncSession = Depends(get_session)):
    import openpyxl, io
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Users"
    ws.append(["ID", "TG_ID", "Role", "Name", "Phone", "Language", "Created At"])
    for u in (await session.execute(select(User))).scalars().all():
        ws.append([u.id, u.tg_user_id, u.role or "", u.name or "", u.phone or "", u.language or "", u.created_at])
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    filename = f"users_{int(datetime.utcnow().timestamp())}.xlsx"
    return StreamingResponse(buf, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename={filename}"})


@app.get("/admin/olympiads/{oid}/registrations/export")
@login_required
async def export_regs(request: Request, oid: int, session: AsyncSession = Depends(get_session)):
    import openpyxl
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Registrations"
    ws.append([
        "ID", "Ticket", "Name", "Phone", "Lang", "Region", "District", "School", "Grade", "Direction", "Group", "Created"
    ])
    regs = (await session.execute(select(Registration).where(Registration.olympiad_id == oid))).scalars().all()
    for r in regs:
        user = await session.get(User, r.user_id)
        direction = await session.get(Direction, r.direction_id) if r.direction_id else None
        group = await session.get(GroupOption, r.group_option_id) if r.group_option_id else None
        ws.append([
            r.id, r.ticket_id, r.full_name, user.phone if user else "", r.language,
            r.region, r.district, r.school, r.grade or "", direction.name if direction else "", group.name if group else "", r.created_at
        ])
    path = STORAGE_DIR / f"registrations_{oid}_{int(datetime.utcnow().timestamp())}.xlsx"
    wb.save(path)
    return RedirectResponse(f"/admin/olympiads/{oid}", status_code=302)


@app.get("/admin/token/{token}")
async def admin_token_login(token: str):
    try:
        data = serializer.loads(token, max_age=86400)
        if data.get("u") != config.admin_username:
            raise BadSignature()
    except Exception:
        return HTMLResponse("Invalid or expired token", status_code=400)
    resp = RedirectResponse("/admin", status_code=302)
    resp.set_cookie("session", token, httponly=True)
    return resp


@app.post("/admin/directions/{did}/groups/bulk")
@login_required
async def add_groups_bulk(request: Request, did: int, groups: str = Form(""), session: AsyncSession = Depends(get_session)):
    d = await session.get(Direction, did)
    if not d:
        return HTMLResponse("Not found", status_code=404)
    if groups:
        names = [x.strip() for x in groups.split(",") if x.strip()]
        res = await session.execute(select(GroupOption).where(GroupOption.direction_id == did).order_by(GroupOption.order.desc()))
        last = res.scalars().first()
        start = (last.order + 1) if last else 0
        for idx, nm in enumerate(names):
            session.add(GroupOption(direction_id=did, name=nm, order=start + idx))
    await session.commit()
    return RedirectResponse(f"/admin/olympiads/{d.olympiad_id}", status_code=302)


@app.get("/admin/about")
@login_required
async def about_get(request: Request, session: AsyncSession = Depends(get_session)):
    a = (await session.execute(select(About))).scalars().first()
    if not a:
        a = About()
        session.add(a)
        await session.commit()
    return templates.TemplateResponse("about.html", {"request": request, "a": a})


@app.post("/admin/about")
@login_required
async def about_post(
    request: Request,
    content_uz: str = Form(""),
    content_ru: str = Form(""),
    content_en: str = Form(""),
    session: AsyncSession = Depends(get_session),
):
    a = (await session.execute(select(About))).scalars().first()
    if not a:
        a = About()
        session.add(a)
    a.content_uz = content_uz
    a.content_ru = content_ru
    a.content_en = content_en
    await session.commit()
    return RedirectResponse("/admin/about", status_code=302)


@app.get("/admin/broadcast")
@login_required
async def broadcast_get(request: Request):
    return templates.TemplateResponse("broadcast.html", {"request": request, "sent": False})


@app.post("/admin/broadcast")
@login_required
async def broadcast_post(
    request: Request,
    text: str = Form(""),
    media: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
):
    bot = get_bot()
    users = (await session.execute(select(User))).scalars().all()
    path = None
    if media and media.filename:
        p = UPLOADS_DIR / f"broadcast_{int(datetime.utcnow().timestamp())}_{media.filename}"
        with open(p, "wb") as f:
            f.write(await media.read())
        path = str(p)
    if bot:
        for u in users:
            try:
                if path and any(path.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png"]):
                    await bot.send_photo(u.tg_user_id, photo=Path(path).open("rb"), caption=text or None)
                elif path and any(path.lower().endswith(ext) for ext in [".mp4"]):
                    await bot.send_video(u.tg_user_id, video=Path(path).open("rb"), caption=text or None)
                else:
                    await bot.send_message(u.tg_user_id, text or "")
            except Exception:
                continue
    return templates.TemplateResponse("broadcast.html", {"request": request, "sent": True})
