from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Form, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN
from tortoise.transactions import in_transaction
from tortoise.exceptions import DoesNotExist
from app.user.authentication import get_current_user, get_privileged_user
from pydantic import BaseModel
import base64
import os
import uuid
from app.task.util import validate_image_file
import io
from starlette.background import BackgroundTask
from app.user.tracker_for_time.schemas import TrackerInfo
from app.user.models_user import UserModel
from app.user.tracker_for_time.models import Tracker
from app.task.models import Task

router2 = APIRouter()

@router2.put("/api/task/track_time")
async def create_track_time(info: TrackerInfo, current_user: UserModel = Depends(get_current_user)):

    # Проверяем существует ли задача с таким task_id
    try:
        task = await Task.get(id=info.task)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Task not found")

    # Создаем новую запись о трекинге времени
    tracker_entry = await Tracker.create(
        user_id=current_user.id,
        task_id=info.task,
        track_date=datetime.strptime(info.track_date, "%Y-%m-%d %H:%M:%S"),  # Преобразуем строку в datetime
        track_amount=info.track_amount
    )

    return {"message": "Time tracked successfully", "tracker_id": tracker_entry.id}

@router2.get("/api/task/trackings/{task_id}")
async def get_track_time_using_id(task_id: int):
    # Получаем все записи по task_id
    trackings = await Tracker.filter(task=task_id)

    # Проверяем, есть ли такие записи
    if not trackings:
        raise HTTPException(status_code=404, detail="No tracking records found for the task")

    # Возвращаем список записей с нужными полями
    result = []
    for tracking in trackings:
        # Проверяем, если track_date не None
        track_date_str = tracking.track_date.strftime("%Y-%m-%d %H:%M:%S") if tracking.track_date else None
        result.append({
            "track_date": track_date_str,
            "track_amount": tracking.track_amount
        })

    return {"task_id": task_id, "trackings": result}

