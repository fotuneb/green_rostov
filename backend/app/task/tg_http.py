import aiohttp
import asyncio
from datetime import datetime
from app.user.models_user import UserModel

#Запрос к боту c переназ, проблемы с дедлайном
async def notify_new_assignee(telegram_id: int, task):
    notification_data = {
        "telegram_id": telegram_id,
        "task_title": task.title,
        "deadline": datetime.fromisoformat(task.deadline).strftime('%d.%m.%Y в %H:%M') if task.deadline else "Не указан",
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://bot:8081/send_change_responsible",  
            json=notification_data,
        ) as response:
            if response.status != 200:
                print(f"Ошибка отправки уведомления: {await response.text()}")


async def notify_upcoming_deadlines():
    while True:
        await asyncio.sleep(60)
        async with aiohttp.ClientSession() as session:
            async with session.get("http://server:8000/api/tasks/deadline") as response:
                if response.status == 200:
                    tasks = await response.json()
                    users_tasks = {}
                    
                    for task in tasks:
                        telegram_id = task["telegram_id"]
                        if telegram_id not in users_tasks:
                            users_tasks[telegram_id] = []
                        users_tasks[telegram_id].append(task)

                    for telegram_id, user_tasks in users_tasks.items():
                        sorted_tasks = sorted(user_tasks, key=lambda x: x["deadline"])
                        message = "\n"
                        for idx, task in enumerate(sorted_tasks, start=1):
                            task_time = datetime.fromisoformat(task['deadline']).strftime('%d.%m.%Y в %H:%M')
                            message += f"{idx}. {task['title']} \nДедлайн: {task_time}\n\n"

                        await send_deadline_notification(telegram_id, message)



async def send_deadline_notification(telegram_id,message):
    user = await UserModel.filter(telegram_id=telegram_id).first()
    payload = {"telegram_id": telegram_id, "message": message}
    print(user.notifications)
    if user.notifications:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://bot:8081/send_deadline", 
                json=payload
                ) as response:
                if response.status != 200:
                    print(f"Ошибка при отправке уведомления пользователю {await response.text()}")
    else:
        return {"msg": "User has disabled notifications"}


