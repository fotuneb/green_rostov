from pydantic import BaseModel
from tortoise.contrib.pydantic import pydantic_model_creator
from app.user.models_user import UserModel




class Rename(BaseModel):
    id: int
    new_title: str


class Column_drag(BaseModel):
    column_id: int
    new_index: int



class TaskPublicInfo(BaseModel):
    title: str
    id_column: int
    id_user: int
    description: str = ""



class Task_for_desc(BaseModel):
    id: int
    desc: str

class Task_change_resposible(BaseModel):
    id: int
    id_user: int

class Task_Drag(BaseModel):
    task_id: int
    new_column_id: int
    new_index: int


class CommentPublicInfo(BaseModel):
    text: str
    id_user: int
    id_task: int



# class Column(BaseModel):
#     title: str
#     index: int
#     tasks: Tasks
