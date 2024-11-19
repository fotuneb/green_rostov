from pydantic import BaseModel
from tortoise.contrib.pydantic import pydantic_model_creator
from app.task.models import Column

class Task(BaseModel):
    id: str
    index: int
    content: str
    responsible: str
    images: dict
    assignee: UserModel

class Tasks(BaseModel):
    __root__: dict[str, Task]


class Column(BaseModel):
    title: str
    index: int
    tasks: Tasks


class Columns(BaseModel):
    __root__: dict[str, Column]

