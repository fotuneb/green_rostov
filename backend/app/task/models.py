from passlib.hash import bcrypt
from tortoise import fields
from tortoise.models import Model
from app.user.models_user import UserModel
from app.task.attachment_model import Attachment

     
class Comments(Model):
    id = fields.IntField(pk=True)
    author = fields.ForeignKeyField("models.UserModel", related_name="tasks_created_for_com")
    text = fields.CharField(max_length=255)
    create_date = fields.DatetimeField(null=True, auto_now_add=True)
    task = fields.ForeignKeyField("models.Task", related_name="comments")
    is_edited = fields.BooleanField(default=False)

    class Meta:
        table = "comments"


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
    created_at = fields.DatetimeField(auto_now_add=True)  # Время создания
    updated_at = fields.DatetimeField(auto_now=True)      # Время обновления
    
    deadline = fields.DatetimeField(null=True)          # Время дедлайна
    time_track = fields.DatetimeField(null=True)        # Храним время в секундах
    is_running = fields.BooleanField(default=False)     # Состояние таймера
    last_started_at = fields.DatetimeField(null=True)   # Когда таймер был запущен
  
    attachments = fields.ManyToManyField("models.Attachment", related_name="tasks_attachments", on_delete=fields.CASCADE)

    class Meta:
        table = "tasks"

