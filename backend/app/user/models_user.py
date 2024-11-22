from passlib.hash import bcrypt
from tortoise import fields
from tortoise.models import Model



class UserModel(Model):    
    id = fields.IntField(pk=True)
    fullname = fields.CharField(null = False, max_length=50)
    login = fields.CharField(null=False, max_length=20, unique=True)
    password = fields.CharField(max_length=60)
    role = fields.CharField(max_length=20, default="guest")
    about = fields.CharField(max_length = 200, null=True, default=None)
    telegram_id = fields.IntField(max_length=200,null=True, default=None)
    notifications = fields.BooleanField(default=True)

    def verify_password(self, password):
        return bcrypt.verify(password, self.password)

    class Meta:
        table: str = "users"