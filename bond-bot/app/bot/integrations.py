from __future__ import annotations

from typing import Any, Dict

import httpx

from app.config import config


async def push_registration(payload: Dict[str, Any]) -> bool:
    if not config.bond_api_url or not config.bond_api_token:
        return False
    url = f"{config.bond_api_url.rstrip('/')}/api/integrations/bot/registrations"
    headers = {"Authorization": f"Bearer {config.bond_api_token}"}
    try:
        async with httpx.AsyncClient(timeout=6) as client:
            response = await client.post(url, json=payload, headers=headers)
            return response.status_code < 300
    except Exception:
        return False
