from pydantic import BaseModel
from tortoise.contrib.pydantic import pydantic_model_creator
from app.user.models_user import UserModel

class UserIn(BaseModel):
    fullname: str
    login: str
    password1: str
    
User = pydantic_model_creator(UserModel, name="User")