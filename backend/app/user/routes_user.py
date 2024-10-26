from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
import re
from app.user.authentication import authenticate_user, create_token, get_current_user
from app.user.models_user import UserModel
from app.user.schemas_user import User, UserIn

router1 = APIRouter()

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

@router1.post("/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid email or password",
        )

    return {"access_token": await create_token(user), "id": user.id}
