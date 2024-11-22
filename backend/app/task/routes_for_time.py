from fastapi import FastAPI, HTTPException
from datetime import datetime, timezone, time
from app.task.models import Task
from app.task.routes import router
from starlette.status import HTTP_400_BAD_REQUEST

def process_deadline(input_deadline: str) -> datetime:
    """
    Преобразует строку дедлайна '31.12.2024 23:00:00' в объект datetime для сохранения в базе данных.
    
    :param input_deadline: Строка с датой и временем в формате 'дд.мм.гггг чч:мм:сс'.
    :return: Объект datetime, совместимый с базой данных.
    """
    try:
        # Преобразуем строку в объект datetime
        deadline_datetime = datetime.strptime(input_deadline, "%d.%m.%Y %H:%M:%S")
        return deadline_datetime
    except ValueError as e:
        raise ValueError(
            f"Некорректный формат строки: '{input_deadline}'. "
            f"Ожидается формат 'дд.мм.гггг чч:мм:сс', например: '31.12.2024 23:00:00'."
        ) from e


def format_time(seconds: int) -> datetime:
    """Преобразует количество секунд в объект datetime.datetime с временем (HH:MM:SS)."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    # Создаём объект datetime с текущей датой и временем, соответствующим секундам
    return datetime.combine(datetime.today(), time(hour=hours, minute=minutes, second=seconds))

def datetime_to_seconds(dt: datetime) -> int:
    """
    Преобразует объект datetime в число секунд, прошедших с начала текущего года, месяца и дня.
    Если datetime не содержит информации о временной зоне, считается локальным временем.
    """
    if dt is None:
        return 0

    # Получаем начало текущего дня
    start_of_day = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=dt.tzinfo)

    # Если dt не содержит информацию о временной зоне
    if dt.tzinfo is None:
        start_of_day = start_of_day.replace(tzinfo=timezone.utc)
        dt = dt.replace(tzinfo=timezone.utc)

    # Возвращаем разницу между текущей датой и dt в секундах
    return int((dt - start_of_day).total_seconds())

@router.post("/tasks/{task_id}/deadline")
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


@router.post("/tasks/{task_id}/start_timer")
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


@router.post("/tasks/{task_id}/del_timer")
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
    
@router.get("/tasks/{task_id}/tracker")
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

@router.post("/tasks/{task_id}/stop_timer")
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

