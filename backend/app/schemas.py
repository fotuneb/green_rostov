from pydantic import BaseModel, EmailStr
from tortoise.contrib.pydantic import pydantic_model_creator

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


class Board(BaseModel):        
    columns: Columns
    columnOrder: list[str]

from app.models_user import UserModel

class UserIn(BaseModel):
    fullname: str
    login: str
    password1: str
    


User = pydantic_model_creator(UserModel, name="User")