from pydantic import BaseModel

class Task(BaseModel):
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