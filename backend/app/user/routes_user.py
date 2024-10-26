from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
import re
from app.user.authentication import authenticate_user, create_token, get_current_user, get_admin_user
from app.user.models_user import UserModel
from app.task.schemas import Board, Task
from app.user.schemas_user import User, UserIn

router1 = APIRouter()
admin_router = APIRouter()

@admin_router.post("/change-role/{user_id}")
async def change_role(user_id: int, new_role: str, admin_user: UserModel = Depends(get_admin_user)):
    user = await UserModel.get(id=user_id)
    user.role = new_role
    await user.save()
    return {"msg": "Role updated successfully"}

@admin_router.post("/change-fullname/{user_id}")
async def change_fullname(user_id: int, new_fullname: str, admin_user: UserModel = Depends(get_admin_user)):
    user = await UserModel.get(id=user_id)
    if not re.fullmatch(r"[A-Za-zА-Яа-яёЁ\s\-]+", new_fullname):
        raise ValueError("Fullname должен содержать только буквы, пробелы и дефисы.")
    user.fullname = new_fullname
    await user.save()
    return {"msg": "Role updated successfully"}

@admin_router.post("/change-password/{user_id}")
async def change_password(user_id: int, new_password: str, admin_user: UserModel = Depends(get_admin_user)):
    user = await UserModel.get(id=user_id)
    if len(new_password) > 20:
            raise ValueError("Пароль должен быть не длиннее 20 символов.")
    user.password = bcrypt.hash(new_password)
    await user.save()
    return {"msg": "Role updated successfully"}

@router1.get("/get_users")
async def get_users():
    users = await UserModel.all().values("id", "fullname", "role")
    return users

@router1.get("/get_users/{user_id}")
async def get_users(user_id: int):  
    user = await UserModel.get(id=user_id).values("fullname", "role", "about")
    return user

@router1.post("/users")
async def create_user(user_in: UserIn):
    
    if not re.fullmatch(r"[A-Za-zА-Яа-яёЁ\s\-]+", user_in.fullname):
            raise ValueError("Fullname должен содержать только буквы, пробелы и дефисы.")
    if len(user_in.password1) > 20:
            raise ValueError("Пароль должен быть не длиннее 20 символов.")
    user = await UserModel.create(
        fullname = user_in.fullname, login=user_in.login, password=bcrypt.hash(user_in.password1)
    )
    

    return {"access_token": await create_token(user)}

@router1.post("/change-about/{user_id}")
async def change_role(user_id: int, new_about: str):
    user = await UserModel.get(id=user_id)
    user.about = new_about
    await user.save()
    return {"msg": "About updated successfully"}

@router1.post("/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid email or password",
        )

    return {"access_token": await create_token(user)}