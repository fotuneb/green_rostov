import asyncio
from aiogram import Bot, Dispatcher
from aiohttp import web

from app.handlers import router
from config import TG_TOKEN
from app.http_handlers import send_message,send_change_responsible


async def main():
    bot = Bot(token=TG_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)

    app = web.Application()
    app["bot"] = bot
    app.router.add_post("/send_message", send_message)
    app.router.add_post("/send_change_responsible",send_change_responsible)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 8081)
    await site.start()

    try:
        await dp.start_polling(bot)
    finally:
        await runner.cleanup()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
#ТЫ ПИДОР