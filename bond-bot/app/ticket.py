from __future__ import annotations

import os
import random
from datetime import datetime
from pathlib import Path
from typing import Tuple, Optional
from PIL import Image, ImageDraw, ImageFont
import json
from app.models import Lang, Registration, Olympiad, Direction, GroupOption


ASSETS_DIR = Path("assets")
STORAGE_DIR = Path("storage")
TICKETS_DIR = STORAGE_DIR / "tickets"
TICKETS_DIR.mkdir(parents=True, exist_ok=True)


def generate_ticket_id() -> str:
    number = random.randint(0, 9_999_999)
    return f"BOND-{number:07d}"


def _load_font(candidates: list[Path], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for p in candidates:
        try:
            if p and p.exists():
                return ImageFont.truetype(str(p), size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def _scale_coords(img: Image.Image, base: Tuple[int, int], x: int, y: int) -> Tuple[int, int]:
    bw, bh = base
    sx = img.width / bw
    sy = img.height / bh
    return int(x * sx), int(y * sy)


def _draw_text(draw: ImageDraw.ImageDraw, xy: Tuple[int, int], text: str, font: ImageFont.ImageFont, fill=(255, 255, 255), max_width: int | None = None):
    x, y = xy
    if max_width is None:
        draw.text((x, y), text, fill=fill, font=font)
        return
    # wrap text by words to fit width
    words = (text or "").split()
    line = ""
    lh = font.size + 6
    for w in words:
        trial = (line + " " + w).strip()
        wwidth = draw.textlength(trial, font=font)
        if wwidth <= max_width:
            line = trial
        else:
            draw.text((x, y), line, fill=fill, font=font)
            y += lh
            line = w
    if line:
        draw.text((x, y), line, fill=fill, font=font)


def _avg_luma(img: Image.Image, center_xy: Tuple[int, int], radius: int = 6) -> float:
    x, y = center_xy
    x0 = max(0, x - radius)
    y0 = max(0, y - radius)
    x1 = min(img.width, x + radius)
    y1 = min(img.height, y + radius)
    if x1 <= x0 or y1 <= y0:
        return 255.0
    region = img.convert("L").crop((x0, y0, x1, y1))
    hist = region.histogram()
    total = sum(v for v in hist)
    if total == 0:
        return 255.0
    # approximate mean
    s = sum(i * v for i, v in enumerate(hist))
    return s / total


def _auto_fill(img: Image.Image, xy_scaled: Tuple[int, int], light=(255, 255, 255), dark=(25, 25, 25)):
    # If background is bright, use dark text; else use light text
    luma = _avg_luma(img, xy_scaled, radius=8)
    return dark if luma > 200 else light


def render_ticket(
    registration: Registration,
    olympiad: Olympiad,
    direction: Direction | None,
    group: GroupOption | None,
    lang: Lang,
    template_name: str | None = None,
) -> str:
    # Template lookup: user-provided first, then assets fallback
    # Try provided template name first
    template: Optional[Path] = None
    if template_name:
        p = (STORAGE_DIR / "templates" / template_name)
        if p.exists():
            template = p
        elif (ASSETS_DIR / template_name).exists():
            template = ASSETS_DIR / template_name
    if template is None:
        # Auto-discover any .png in storage/templates (prefer files containing 'blank')
        templ_dir = STORAGE_DIR / "templates"
        if templ_dir.exists():
            pngs = sorted([x for x in templ_dir.glob("*.png")])
            if pngs:
                blank = [x for x in pngs if "blank" in x.stem.lower()]
                template = (blank[0] if blank else pngs[0])
    if template is None:
        # Also allow placing the blank under storage/tickets (common mistake)
        ticket_dir = STORAGE_DIR / "tickets"
        p = ticket_dir / "ticket_blank.png"
        if p.exists():
            template = p
        else:
            pngs = sorted([x for x in ticket_dir.glob("*.png") if "blank" in x.stem.lower()])
            if pngs:
                template = pngs[0]
    if template is None:
        # Fallback to assets
        candidates = [
            ASSETS_DIR / "ticket_template_bond_blank.png",
            ASSETS_DIR / "ticket_template_default.png",
        ]
        template = next((p for p in candidates if p.exists()), None)

    if template is None:
        img = Image.new("RGB", (1920, 1080), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.text((40, 40), "BOND Olympiad Ticket", fill=(0, 0, 0))
    else:
        img = Image.open(template).convert("RGBA").copy()
        draw = ImageDraw.Draw(img)

    # Read optional positions config
    base = (1920, 1080)
    positions_path = STORAGE_DIR / "templates" / "ticket_positions.json"
    pos = {}
    if positions_path.exists():
        try:
            pos = json.loads(positions_path.read_text(encoding="utf-8"))
            bw = pos.get("base_w") or base[0]
            bh = pos.get("base_h") or base[1]
            base = (int(bw), int(bh))
        except Exception:
            pos = {}

    # Fonts
    font_candidates = [
        STORAGE_DIR / "Font" / "Euclid Circular A SemiBold.ttf",
        ASSETS_DIR / "Euclid-Circular-A-SemiBold.ttf",
        ASSETS_DIR / "Inter-SemiBold.ttf",
    ]
    font_title = _load_font(font_candidates, size=72)
    font_label = _load_font(font_candidates, size=40)
    font_value = _load_font(font_candidates, size=44)
    font_id = _load_font(font_candidates, size=48)

    # Colors sampled from design (approx)
    white = (255, 255, 255)
    blue = (0, 120, 215)
    orange = (240, 166, 28)
    dark = (25, 25, 25)

    # Language printable
    lang_map = {Lang.UZ: "O'zbek", Lang.RU: "Rus", Lang.EN: "Ingliz"}
    lang_text = lang_map.get(registration.language, registration.language.value if hasattr(registration.language, 'value') else str(registration.language))

    # Values
    title = olympiad.name or "BOND Olympiad"
    person = registration.full_name or ""
    direction_text = (direction.name if direction else "-") + (", " + lang_text if lang_text else "")
    level_text = group.name if group else (registration.grade or "-")
    def fmt_date(d: datetime, lang_code: Lang) -> str:
        months_uz = [
            "yanvar", "fevral", "mart", "aprel", "may", "iyun",
            "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr",
        ]
        months_ru = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря",
        ]
        if lang_code == Lang.RU:
            return f"{d.day}-{months_ru[d.month-1]}"
        if lang_code == Lang.EN:
            return d.strftime("%d %b")
        return f"{d.day}-{months_uz[d.month-1]}"

    dt_text = fmt_date(olympiad.event_at, registration.language)
    time_text = olympiad.event_at.strftime('%H:%M')
    address_text = olympiad.address
    phone_text = olympiad.contact_phone
    ticket_id = registration.ticket_id

    # Positioning based on base grid; allow override via positions JSON
    # Title
    if pos.get("title_line1") and pos.get("title_line2"):
        draw.text(_scale_coords(img, base, *pos["title_line1"]), title, fill=orange, font=font_title)
    else:
        # Split into two lines if long
        title_words = title.split()
        line1 = ""
        line2 = ""
        for w in title_words:
            if len(line1) + 1 + len(w) <= 22:
                line1 = (line1 + " " + w).strip()
            else:
                line2 = (line2 + " " + w).strip()
        draw.text(_scale_coords(img, base, 160, 120), line1, fill=orange, font=font_title)
        if line2:
            draw.text(_scale_coords(img, base, 160, 200), line2, fill=orange, font=font_title)

    # Participant info bars
    # Name
    name_xy_base = tuple(pos.get("name_xy", [760, 360]))
    name_xy_scaled = _scale_coords(img, base, *name_xy_base)
    name_fill = _auto_fill(img, name_xy_scaled, light=white, dark=dark)
    _draw_text(draw, name_xy_scaled, person, font_value, fill=name_fill, max_width=int(img.width * 0.56))
    # Direction + Language
    dir_xy_base = tuple(pos.get("direction_xy", [760, 460]))
    dir_xy_scaled = _scale_coords(img, base, *dir_xy_base)
    dir_fill = _auto_fill(img, dir_xy_scaled, light=white, dark=dark)
    _draw_text(draw, dir_xy_scaled, direction_text, font_value, fill=dir_fill, max_width=int(img.width * 0.56))
    # Level or Grade
    level_xy_base = tuple(pos.get("level_xy", [760, 560]))
    level_xy_scaled = _scale_coords(img, base, *level_xy_base)
    level_fill = _auto_fill(img, level_xy_scaled, light=white, dark=dark)
    _draw_text(draw, level_xy_scaled, level_text, font_value, fill=level_fill, max_width=int(img.width * 0.56))

    # Olympiad info bars (orange)
    # Date and time small boxes
    date_xy_base = tuple(pos.get("date_xy", [760, 760]))
    time_xy_base = tuple(pos.get("time_xy", [1140, 760]))
    date_xy_scaled = _scale_coords(img, base, *date_xy_base)
    time_xy_scaled = _scale_coords(img, base, *time_xy_base)
    date_fill = _auto_fill(img, date_xy_scaled, light=white, dark=dark)
    time_fill = _auto_fill(img, time_xy_scaled, light=white, dark=dark)
    _draw_text(draw, date_xy_scaled, dt_text, font_value, fill=date_fill, max_width=int(img.width * 0.18))
    _draw_text(draw, time_xy_scaled, time_text, font_value, fill=time_fill, max_width=int(img.width * 0.12))
    # Address long bar
    addr_xy_base = tuple(pos.get("address_xy", [760, 860]))
    addr_xy_scaled = _scale_coords(img, base, *addr_xy_base)
    addr_fill = _auto_fill(img, addr_xy_scaled, light=white, dark=dark)
    _draw_text(draw, addr_xy_scaled, address_text, font_value, fill=addr_fill, max_width=int(img.width * 0.60))
    # Phone long bar
    phone_xy_base = tuple(pos.get("phone_xy", [760, 960]))
    phone_xy_scaled = _scale_coords(img, base, *phone_xy_base)
    phone_fill = _auto_fill(img, phone_xy_scaled, light=white, dark=dark)
    _draw_text(draw, phone_xy_scaled, phone_text, font_value, fill=phone_fill, max_width=int(img.width * 0.60))

    # ID bottom-left: "ID: BOND-XXXXXXX" with colored ID
    id_label_xy = _scale_coords(img, base, *(pos.get("id_label_xy", [160, 980])))
    draw.text(id_label_xy, "ID:", fill=blue, font=font_id)
    id_val_xy = _scale_coords(img, base, *(pos.get("id_value_xy", [240, 980])))
    draw.text(id_val_xy, f" {ticket_id}", fill=orange, font=font_id)

    out_path = TICKETS_DIR / f"{registration.ticket_id}.png"
    img.convert("RGB").save(out_path, format="PNG")
    return str(out_path)
