from tortoise import fields
from tortoise.models import Model

class Attachment(Model):
    id = fields.IntField(pk=True)
    file_path = fields.CharField(max_length=255, null=True, default=None)  # Путь к файлу или URL
    uploaded_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "attachments"