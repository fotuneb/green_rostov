from aiohttp import web
from aiogram import Bot


# Пробная Функция для обработки входящих HTTP-запросов
async def send_message(request):
    data = await request.json()
    telegram_id = data.get("telegram_id")
    message = data.get("message")

    if not telegram_id or not message:
        return web.json_response({"status": "error", "message": "Invalid request data"}, status=400)

    bot: Bot = request.app["bot"]
    
    try:
        await bot.send_message(chat_id=telegram_id, text=message)
        return web.json_response({"status": "success", "message": "Message sent"})
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)

#Функция для уведомления пользователя о назначения на задачу
async def send_change_responsible(request):
    data = await request.json()
    telegram_id = data["telegram_id"]
    task_title = data["task_title"]
    #deadline = data.get("deadline")

    bot: Bot = request.app["bot"]

    message = (
        f"🔖 <b>Вы были назначены на задачу</b> \n\n"
        f" Название задачи - {task_title}\n"
        #f"Дедлайн: {deadline}\n"
    )

    await bot.send_message(chat_id=telegram_id, text=message, parse_mode="HTML")
    return web.json_response({"status": "success"})

    