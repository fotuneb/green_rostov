import aiohttp

async def auth(telegram_id):
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://server:8000/api/check_telegram_link/{telegram_id}"
        ) as response:
            if response.status == 200:
                user_data = await response.json()
                if user_data.get("telegram_id") == telegram_id:
                    username = user_data.get("username")
                    return username

async def reg(user_id, telegram_id):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://server:8000/api/link_telegram",
            json={"user_id": user_id, "telegram_id": telegram_id},
        ) as response:
            if response.status == 200:
                return True