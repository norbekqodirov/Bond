import os
from dataclasses import dataclass
from dotenv import load_dotenv


load_dotenv()


@dataclass
class Config:
    telegram_token: str = os.getenv("TELEGRAM_TOKEN", "")
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./storage/app.db")
    admin_ids: list[int] = None
    group_chat_id: int | None = None
    admin_username: str = os.getenv("ADMIN_WEB_USERNAME", "admin")
    admin_password: str = os.getenv("ADMIN_WEB_PASSWORD", "change-me")
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "8000"))
    default_contact_handle: str = os.getenv("DEFAULT_CONTACT_HANDLE", "@bondmenejer")
    default_contact_phone: str = os.getenv("DEFAULT_CONTACT_PHONE", "+998773160555")
    bond_api_url: str = os.getenv("BOND_API_URL", "")
    bond_api_token: str = os.getenv("BOND_API_TOKEN", "")

    def __post_init__(self):
        admins = os.getenv("ADMIN_IDS", "")
        self.admin_ids = [int(x.strip()) for x in admins.split(",") if x.strip().isdigit()]
        gcid = os.getenv("GROUP_CHAT_ID")
        self.group_chat_id = int(gcid) if gcid and gcid.strip("-+").isdigit() else None


config = Config()
