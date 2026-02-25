Bond Olympiad – Production Deploy Guide

Overview
- App bundles a Telegram bot (aiogram polling) and an Admin web panel (FastAPI + Uvicorn) in a single process.
- Run it as a systemd service and put Nginx in front (HTTP/HTTPS).
- Domain example: bondolympiad.uz (admin at https://bondolympiad.uz/admin)

1) Server prerequisites (Ubuntu 22.04+)
- SSH into the server
  ssh root@YOUR_IP
- Install packages
  apt update && apt install -y python3-venv python3-pip git nginx

2) Create app user and directories
- (Recommended)
  adduser --disabled-password --gecos "" bond
  usermod -aG sudo bond
- App folder
  mkdir -p /opt/bond && chown -R bond:bond /opt/bond

3) Upload project
- Copy repo contents to /opt/bond (git clone or SFTP)
- Create storage folders
  mkdir -p /opt/bond/storage/uploads /opt/bond/storage/tickets /opt/bond/storage/templates

4) Python environment
  cd /opt/bond
  python3 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt

5) Environment (.env)
- Create /opt/bond/.env with at least:
  TELEGRAM_TOKEN=YOUR_BOT_TOKEN
  ADMIN_WEB_USERNAME=admin
  ADMIN_WEB_PASSWORD=StrongPass123
  HOST=0.0.0.0
  PORT=8000
  DEFAULT_CONTACT_HANDLE=@bondmenejer
  DEFAULT_CONTACT_PHONE=+998773160555
  # Optional
  # ADMIN_IDS=123456789
  # GROUP_CHAT_ID=-1001234567890
  # DATABASE_URL=sqlite+aiosqlite:////opt/bond/storage/app.db

6) systemd service
- Put this file to /etc/systemd/system/bond.service:

  [Unit]
  Description=Bond Olympiad Bot + Admin
  After=network.target

  [Service]
  WorkingDirectory=/opt/bond
  EnvironmentFile=/opt/bond/.env
  ExecStart=/opt/bond/venv/bin/python -m app.main
  Restart=always
  User=bond
  Group=bond

  [Install]
  WantedBy=multi-user.target

- Enable and start
  systemctl daemon-reload
  systemctl enable --now bond
  journalctl -u bond -f

7) Nginx reverse proxy (HTTP → Uvicorn)
- Create /etc/nginx/sites-available/bondolympiad.conf with:

  server {
    listen 80;
    server_name bondolympiad.uz www.bondolympiad.uz;

    location / {
      proxy_pass http://127.0.0.1:8000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }

- Enable site and reload
  ln -s /etc/nginx/sites-available/bondolympiad.conf /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx

- Admin web now at: http://bondolympiad.uz/admin

8) HTTPS (Let’s Encrypt)
- Ensure DNS A record → your server IP
- Install certbot
  apt install -y certbot python3-certbot-nginx
- Issue cert
  certbot --nginx -d bondolympiad.uz -d www.bondolympiad.uz
- Auto renew is handled by systemd timers

9) Poster/PDF and storage
- Upload poster (image/video) and optional PDF via Admin → Olympiads → New.
- Posters: storage/uploads/
- Tickets generated: storage/tickets/

10) Local development
- .env for local:
  HOST=127.0.0.1
  PORT=8000
- Run
  python -m app.main
- Admin: http://127.0.0.1:8000/admin

Notes
- Bot polling and web admin run in a single process via app.main
- If you want separate gunicorn/uvicorn for admin and a separate bot worker, split processes, but the current setup is simpler and sufficient for most deployments.

