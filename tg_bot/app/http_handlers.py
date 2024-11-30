from aiohttp import web
from aiogram import Bot
from datetime import datetime
from aiogram.utils.deep_linking import create_start_link
from app.utils import identify_mess

#Функция для уведомления пользователя о назначения на задачу
async def send_changing(request):
    data = await request.json()
    telegram_id = data["telegram_id"]
    task_title = data["task_title"]
    deadline = data["deadline"]
    attr = data["attr"]

    bot: Bot = request.app["bot"]

    try:
        temp = datetime.fromisoformat(deadline).strftime('%d.%m.%Y в %H:%M') if deadline else "Не указан"
    except ValueError:
        temp = "Не указан"
    
    ident = identify_mess(attr)

    message = (f"{ident}\n",
        f" Название задачи - {task_title}\n"
        f" Дедлайн - {temp}\n"
    )

    await bot.send_message(chat_id=telegram_id, text=message, parse_mode="HTML")
    return web.json_response({"status": "success"})

#Функция для уведомления пользователя о приближающихся дедлайнах
async def send_deadline(request):
    data = await request.json()
    
    telegram_id = data["telegram_id"]

    message = f"❗️❗️❗️ <b>Дедлайн этих задач подходит к концу:</b> \n"
    message += data["message"]

    bot: Bot = request.app["bot"]

    await bot.send_message(chat_id=telegram_id, text=message, parse_mode="HTML")
    return web.json_response({"status": "success"})

async def generate_link(request):
    data = await request.json()
    user_id = data["user_id"]
    bot: Bot = request.app["bot"]
    link = await create_start_link(bot, user_id,encode=True)

    return web.json_response({"link": link})
    
    