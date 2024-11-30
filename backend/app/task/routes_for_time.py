from fastapi import FastAPI, HTTPException
from datetime import datetime, timezone, time
from app.task.models import Task
from app.task.routes import router
from starlette.status import HTTP_400_BAD_REQUEST
from app.task.util import process_deadline, format_time, datetime_to_seconds
from app.user.authentication import get_current_user, get_privileged_user
from app.user.models_user import UserModel
from fastapi import Depends
from app.task.tg_http import notify_new_assignee


@router.post("/api/tasks/{task_id}/deadline")
async def update_deadline(task_id: int, new_deadline: str, current_user: UserModel = Depends(get_privileged_user)):
    """
    Обновить или установить новый deadline для задачи.
    :param task_id: ID задачи.
    :param new_deadline: Новый дедлайн в формате '31.12.2024 23:00:00'.
    """
    # Получаем задачу по ID
    task = await Task.get_or_none(id=task_id)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

    try:
        # Преобразуем строку дедлайна в объект datetime
        deadline_datetime = process_deadline(new_deadline)
    except ValueError as e:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=str(e))

    # Обновляем дедлайн и сохраняем
    task.deadline = deadline_datetime
    await task.save()

    assignee = await task.assignee  
  
    if not assignee or not assignee.telegram_id:
        return {"new_deadline": task.deadline}

    if assignee.notifications:
        await notify_new_assignee(assignee.telegram_id, task, "deadline")

    return {"new_deadline": task.deadline}