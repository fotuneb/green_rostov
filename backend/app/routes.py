from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
import re
from app.authentication import authenticate_user, create_token, get_current_user
from backend.app.models_user import UserModel
from app.schemas import Board, User, UserIn, Task

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


@router.post("/users")
async def create_user(user_in: UserIn):
    
    if not re.fullmatch(r"[A-Za-zА-Яа-яёЁ\s\-]+", user_in.fullname):
            raise ValueError("Fullname должен содержать только буквы, пробелы и дефисы.")
    if len(user_in.password1) > 20:
            raise ValueError("Пароль должен быть не длиннее 20 символов.")
    user = await UserModel.create(
        fullname = user_in.fullname, login=user_in.login, password=bcrypt.hash(user_in.password1)
    )
    

    return {"access_token": await create_token(user)}




@router.post("/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid email or password",
        )

    return {"access_token": await create_token(user)}


# @router.get("/Task")
# async def something1(user: User = Depends(get_current_user)):
#     user = await UserModel.get(id=user.id)
#     return {"detail": str(user) + " " + str(user.id)}


   
@router.get("/Task/{task_id}")
async def get_task(task_id: str, user: User = Depends(get_current_user)): # type: ignore
    for column in board.columns.root.values(): # type: ignore
        if task_id in column.tasks.root:
            return {"task": column.tasks.root[task_id]}
    
    raise HTTPException(status_code=status.HTTP_404_BAD_REQUEST, detail="Задача не найдена")


@router.post("/task")
async def save_task(task: Task, user: User = Depends(get_current_user)):
    user = await UserModel.get(id=user.id)
    user.task = task.json()
    await user.save()

    # тут че то надо сделать
    return {"message": "success"}
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail= "".join(map(str, task)) + ", " + str(user)         # 422
    )


# обращение к task'ам get & put, задавать значения position относительно тасков 