from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import Depends
import uvicorn
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import TelegramObject
from aiogram.client.default import DefaultBotProperties

from app.config import config
from app.db import engine, Base
from app.web.app import app as fastapi_app
from app.bot.handlers import router as bot_router
from app.bot.middleware import DBSessionMiddleware
from app.broker import set_bot


logging.basicConfig(level=logging.INFO)


async def on_startup(bot: Bot):
    from aiogram.types import BotCommand
    # Only expose /start to users
    await bot.set_my_commands([BotCommand(command="start", description="Start")])


async def run_bot():
    bot = Bot(token=config.telegram_token, default=DefaultBotProperties(parse_mode="HTML"))
    dp = Dispatcher(storage=MemoryStorage())
    dp.message.middleware(DBSessionMiddleware())
    dp.callback_query.middleware(DBSessionMiddleware())
    dp.include_router(bot_router)
    await on_startup(bot)
    set_bot(bot)
    await dp.start_polling(bot)


async def run_web():
    # Run FastAPI via uvicorn programmatically
    config_uv = uvicorn.Config(fastapi_app, host=config.host, port=config.port, log_level="info")
    server = uvicorn.Server(config_uv)
    await server.serve()


async def prepare_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure 'fee' column exists on 'olympiads' (SQLite simple migration)
        try:
            await conn.exec_driver_sql("ALTER TABLE olympiads ADD COLUMN fee INTEGER DEFAULT 0")
        except Exception:
            # Column may already exist
            pass


async def main():
    await prepare_db()
    await asyncio.gather(run_bot(), run_web())


if __name__ == "__main__":
    asyncio.run(main())
