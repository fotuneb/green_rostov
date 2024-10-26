from pydantic import BaseModel, EmailStr
from tortoise.contrib.pydantic import pydantic_model_creator

from app.models import UserModel


class Task(BaseModel):      # +- done on Arman
    id: str
    index: int
    content: str
    responsible: str
    


class Tasks(BaseModel):
    __root__: dict[str, Task]


class Column(BaseModel):
    id: str
    title: str
    tasks: Tasks
    taskIds: list[str]


class Columns(BaseModel):
    __root__: dict[str, Column]


class Board(BaseModel):         # done
    columns: Columns
    columnOrder: list[str]


class UserIn(BaseModel):
    fullname: str
    login: str
    password1: str
    


User = pydantic_model_creator(UserModel, name="User")
