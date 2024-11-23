from fastapi import FastAPI, HTTPException
from datetime import datetime, timezone, time
from app.task.models import Task
from app.task.routes import router
from starlette.status import HTTP_400_BAD_REQUEST
from app.task.util import process_deadline, format_time, datetime_to_seconds


@router.post("/api/tasks/{task_id}/deadline")
async def update_deadline(task_id: int, new_deadline: str):
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

    return {"new_deadline": task.deadline}


@router.post("/api/tasks/{task_id}/start_timer")
async def start_timer(task_id: int):
    task = await Task.get_or_none(id=task_id)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")
    if task.is_running:
        return {"message": "Timer is already running"}

    task.is_running = True
    task.last_started_at = datetime.now()

    await task.save()
    return {"message": "Timer started"}


@router.post("/api/tasks/{task_id}/del_timer")
async def del_timer(task_id: int):
    task = await Task.get_or_none(id=task_id)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

    # Ensure `now` is timezone-aware
    now = datetime.now(tz=timezone.utc)
    
    # Ensure `last_started_at` is timezone-aware
    if task.last_started_at.tzinfo is None:
        task.last_started_at = task.last_started_at.replace(tzinfo=timezone.utc)

    # Calculate elapsed time
    elapsed_time = (now - task.last_started_at).total_seconds()
    
    time = task.time_track or 0
    if time != 0:
        time = datetime_to_seconds(time)

    # Add elapsed time to `time_track`
    time = time + int(elapsed_time)

    formatted_time = format_time(time)
    
    # Stop the timer
    task.time_track = None
    task.is_running = False
    task.last_started_at = None

    await task.save()
    return {
        "message": "The timer has been deleted",
        "total_time": format_time
    }
    
@router.get("/api/tasks/{task_id}/tracker")
async def get_task_tracker(task_id: int):
    task = await Task.get_or_none(id=task_id)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

    total_seconds = task.time_track or 0  # Ensure time_track is not None
    if total_seconds != 0:
        total_seconds = datetime_to_seconds(total_seconds)

    if task.is_running:
        if task.last_started_at is not None:  # Check if last_started_at is valid
            # Make `now` timezone-aware to match `task.last_started_at`
            now = datetime.now(tz=timezone.utc)
            elapsed_time = (now - task.last_started_at).total_seconds()
            total_seconds += int(elapsed_time)
        status = "запущен"
    else:
        status = "остановлен"

    formatted_time = format_time(total_seconds)

    return {
        "time_track": formatted_time,
        "status": status
    }

@router.post("/api/tasks/{task_id}/stop_timer")
async def stop_timer(task_id: int):
    task = await Task.get_or_none(id=task_id)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")
    if not task.is_running:
        return {"message": "Timer is not running"}

    # Ensure `now` is timezone-aware
    now = datetime.now(tz=timezone.utc)
    
    # Ensure `last_started_at` is timezone-aware
    if task.last_started_at.tzinfo is None:
        task.last_started_at = task.last_started_at.replace(tzinfo=timezone.utc)

    # Calculate elapsed time
    elapsed_time = (now - task.last_started_at).total_seconds()
    
    time = task.time_track or 0
    if time != 0:
        time = datetime_to_seconds(time)

    # Add elapsed time to `time_track`
    time = time + int(elapsed_time)

    formatted_time = format_time(time)
    
    # Stop the timer
    task.time_track = formatted_time
    task.is_running = False
    task.last_started_at = None

    await task.save()
    return {
        "message": "Timer stopped",
        "total_time": formatted_time
    }
