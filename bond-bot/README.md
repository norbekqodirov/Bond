BOND Olympiad Registration Bot

Overview
- Telegram bot for registering school students to Olympiads
- FastAPI admin panel to manage Olympiads, exports, stats, and broadcasts
- SQLite database (default) with SQLAlchemy ORM
- Multilingual bot interface (UZ/RU/EN)
- Ticket image generation (Pillow) with unique ID like BOND-1234567

Quick Start
1) Prerequisites
- Python 3.10+
- Telegram Bot Token
- A Telegram group/channel ID for leads (optional but recommended)

2) Configure env
- Copy `.env.example` to `.env` and set values:
  - TELEGRAM_TOKEN
  - ADMIN_IDS (comma-separated Telegram user IDs)
  - GROUP_CHAT_ID (for leads)
  - ADMIN_WEB_USERNAME / ADMIN_WEB_PASSWORD
  - DATABASE_URL (optional, default is SQLite)

3) Install deps
- pip install -r requirements.txt

4) Run
- Option A: single process (FastAPI + bot)
  - python -m app.main
- Admin panel: http://127.0.0.1:8000/admin

Admin Panel Features
- Create/manage Olympiads
- Upload poster and PDF
- Configure directions (class-based or level-based)
- Configure languages (UZ/RU/EN)
- Export registrations to Excel
- Export users to Excel
- Broadcast posts (text + optional media) to users
- Edit About page content

Bot Features
- /start → language selection → quick profile (role, name, phone)
- Main menu: Olympiads, About, Contact
- Olympiad view shows poster + full caption + @bond_olympiad mention
- Registration flow per Olympiad with validation and confirmation
- Ticket generation with unique ID and details; sent to user
- Sends each registration as a lead to configured GROUP_CHAT_ID

Ticket Templates
- Put your ticket PNG templates under `assets/` as needed
- You can use `assets/ticket_template_default.png` as a base or replace it

Project Structure
- app/
  - config.py, db.py, models.py
  - i18n.py
  - ticket.py (image generation)
  - main.py (entrypoint combining bot + admin)
  - bot/ (aiogram handlers, FSM, keyboards)
  - web/ (FastAPI app, templates, static)
- assets/ (ticket templates)
- storage/ (uploaded files, posters, pdfs, generated tickets)

Notes
- For Excel exports we use openpyxl
- For image generation we use Pillow
- This repo includes minimal placeholder templates and pages; adjust styles/content as needed

