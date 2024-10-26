from typing import Union

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.models import UserModel, Board, Column, Task
from app.schemas import User

oath2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def create_token(user: UserModel) -> str:
    user_obj = await User.from_tortoise_orm(user)
    return jwt.encode(user_obj.dict(), settings.jwt_secret)


async def authenticate_user(fullname: str, login: str, password: str) -> Union[User, bool]: # type: ignore
    user = await UserModel.get_or_none(fullname=fullname, login=login)
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




async def get_board_id_by_author(author_id: int) -> int:
    try:
        board = await Board.get(author_id=author_id)
        return board.id
    except Board.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found for the specified author",
        )
 

async def get_task_id_by_author(author_id: int) -> int:
    try:
        task = await Task.get(author_id=author_id)
        return task.id
    except Task.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found for the specified author",
        )


async def get_task_id_by_column(column_id: int) -> int:
    try:
        task = await Task.get(column_id=column_id)
        return task.id
    except Task.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found for the specified column",
        )