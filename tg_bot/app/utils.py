async def identify_mess(attr):
    message = ''
    if attr == "deadline":
        message += "🔖 <b>Дедлайн задачи был изменен</b> \n\n"

    if attr == "change_responsible":
         message += "🔖 <b>Вы были назначены исполнителем задачи</b> \n\n"

    if attr == "create_task":
        message += "🔖 <b>Для вас была создана задача</b> \n\n"

    return message