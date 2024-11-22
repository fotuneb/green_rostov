from typing import Union

import jwt
from itsdangerous import URLSafeTimedSerializer
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.user.models_user import UserModel
from app.user.schemas_user import User
from app.config import settings

oath2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def create_token(user: UserModel) -> str:
    user_obj = await User.from_tortoise_orm(user)
    return jwt.encode(user_obj.dict(), settings.jwt_secret)


async def authenticate_user(login: str, password: str) -> Union[User, bool]: # type: ignore
    user = await UserModel.get_or_none(login=login)
    if not user or not user.verify_password(password):
        return False
    
    return user


async def get_current_user(token: str = Depends(oath2_scheme)):
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user = await UserModel.get(id=payload.get("id"))

    except Exception:           # ошибка при авторизации при неправильных данных, нужен вывод о неправильности входных данных
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login or password",
        )

    return await User.from_tortoise_orm(user)

async def get_admin_user(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    return current_user

async def generate_telegram_link(user_id: int):
    serializer = URLSafeTimedSerializer(settings.secret_key)
    token = serializer.dumps(user_id)

    return f"https://t.me/{settings.bot_name}?start={token}"