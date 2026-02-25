from __future__ import annotations

import asyncio


async def _run():
    from app.main import main as app_main
    await app_main()


if __name__ == "__main__":
    asyncio.run(_run())

