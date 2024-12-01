import asyncio
import os
from aiogram import Bot, Dispatcher
from aiohttp import web

from app.handlers import router
from app.http_handlers import send_changing, send_deadline, generate_link


async def main():
    bot = Bot(token=os.environ['BOT_SECRET_TOKEN'])
    dp = Dispatcher()
    dp.include_router(router)

    app = web.Application()
    app["bot"] = bot
    app.router.add_post("/send_changing",send_changing)
    app.router.add_post("/send_deadline", send_deadline)
    app.router.add_post("/generate_link", generate_link)

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
