from passlib.hash import bcrypt
from tortoise import fields
from tortoise.models import Model
from app.user.models_user import UserModel

     
class Board(Model):
    id = fields.IntField(pk=True)
    author = fields.ForeignKeyField("models.UserModel", related_name="boards")
    participants = fields.ManyToManyField("models.UserModel", related_name="participated_boards", table="board_participants")

    class Meta:
        table = "boards"


class Column(Model):
    id = fields.IntField(pk=True)
    board = fields.ForeignKeyField("models.Board", related_name="columns", on_delete=fields.CASCADE)
    index = fields.IntField()
    
    class Meta:
        table = "columns"
        ordering = ["index"]  # Упорядочивание по индексу


class Task(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    author = fields.ForeignKeyField("models.UserModel", related_name="tasks_created")
    assignee = fields.ForeignKeyField("models.UserModel", related_name="tasks_assigned")
    column = fields.ForeignKeyField("models.Column", related_name="tasks", on_delete=fields.CASCADE)
    

    class Meta:
        table = "tasks"
