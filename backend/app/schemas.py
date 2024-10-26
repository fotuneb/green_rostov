from pydantic import BaseModel, EmailStr
from tortoise.contrib.pydantic import pydantic_model_creator



class Task(BaseModel):
    id: int
    title: str
    index: int
    content: str
    responsible: str
    author: str
    # column_id: fields.IntField
    


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

