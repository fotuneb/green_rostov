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

router = APIRouter()

