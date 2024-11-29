from tortoise import fields
from tortoise.models import Model
from app.user.models_user import UserModel
from app.task.models import Task

class Tracker(Model):
    id = fields.IntField(pk=True)
    author = fields.ForeignKeyField("models.UserModel", related_name="id_user")
    task_id = fields.ForeignKeyField("models.Task", related_name="id_task")
    started_at = fields.DatetimeField(null=True) # Когда таймер был запущен
    time_tracked = fields.IntField(null=True) # В секундах сколько затрекано