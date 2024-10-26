from passlib.hash import bcrypt
from tortoise import fields
from tortoise.models import Model
#from tortoise.exceptions import ValidationError
#import re


class UserModel(Model):
    id = fields.IntField(pk=True)
    fullname = fields.CharField(null = False, max_length=50)
    email = fields.CharField(null=False, max_length=255, unique=True)
    password = fields.CharField(max_length=255)
    board = fields.JSONField(default={"tasks": {}, "columns": {}, "columnOrder": []})

    def verify_password(self, password):
        return bcrypt.verify(password, self.password)

    class Meta:
        table: str = "users"
