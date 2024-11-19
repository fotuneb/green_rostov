from pydantic import BaseModel
from tortoise.contrib.pydantic import pydantic_model_creator
from app.task.models import Column



class Column(BaseModel):
    title: str
    index: int
    tasks: Tasks



