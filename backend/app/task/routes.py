from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
import re
from app.user.authentication import authenticate_user, create_token, get_current_user
from app.user.models_user import UserModel
from app.task.schemas import Board, Task
from app.user.schemas_user import User, UserIn

router = APIRouter()


@router.get("/board")
async def get_board(user: User = Depends(get_current_user)): # type: ignore    # done
    user = await UserModel.get(id=user.id)

    return {"board": user.board}


@router.put("/board")
async def save_board(board: Board, user: User = Depends(get_current_user)): # type: ignore     # done
    user = await UserModel.get(id=user.id)
    user.board = board.json()
    await user.save()

    return {"message": "success"}

@router.get("/Task/{task_id}")
async def get_task(task_id: str, user: User = Depends(get_current_user)): # type: ignore
    for column in board.columns.root.values(): # type: ignore
        if task_id in column.tasks.root:
            return {"task": column.tasks.root[task_id]}
    
    raise HTTPException(status_code=status.HTTP_404_BAD_REQUEST, detail="Задача не найдена")


@router.post("/task")
async def save_task(task: Task, user: User = Depends(get_current_user)): # type: ignore
    user = await UserModel.get(id=user.id)
    user.task = task.json()
    await user.save()

    # тут че то надо сделать
    return {"message": "success"}