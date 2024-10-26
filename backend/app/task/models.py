from passlib.hash import bcrypt
from tortoise import fields
from tortoise.models import Model
from app.user.models_user import UserModel

     
class Comments(Model):
    id = fields.IntField(pk=True)
    author = fields.ForeignKeyField("models.UserModel", related_name="tasks_created_for_com")
    text = fields.CharField(max_length=255)
    create_date = fields.DatetimeField(null=True, auto_now_add=True)
    task = fields.ForeignKeyField("models.Task", related_name="comments")


class Column(Model):
    id = fields.IntField(pk=True)
    index = fields.IntField()
    title = fields.CharField(max_length=255)
    
    class Meta:
        table = "columns"
        ordering = ["index"]  # Упорядочивание по индексу


class Task(Model):
    id = fields.IntField(pk=True)
    index = fields.IntField()
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    author = fields.ForeignKeyField("models.UserModel", related_name="tasks_created")
    assignee = fields.ForeignKeyField("models.UserModel", related_name="tasks_assigned")
    column = fields.ForeignKeyField("models.Column", related_name="column", on_delete=fields.CASCADE)
    

    class Meta:
        table = "tasks"
