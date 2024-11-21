import aiohttp

#Запрос к боту c переназ, проблемы с дедлайном
async def notify_new_assignee(telegram_id: int, task):
    notification_data = {
        "telegram_id": telegram_id,
        "task_title": task.title,
        #"deadline": task.deadline if task.deadline else "Не указан",
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://bot:8081/send_change_responsible",  
            json=notification_data,
        ) as response:
            if response.status != 200:
                print(f"Ошибка отправки уведомления: {await response.text()}")

