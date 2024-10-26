from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
import re
from app.authentication import authenticate_user, create_token, get_current_user, get_board_id_by_author, get_task_id_by_author
from app.models import UserModel
from app.schemas import Board, User, UserIn, Task

router = APIRouter()




@router.post("/users")
async def create_user(user_in: UserIn):
    
    if not re.fullmatch(r'^[A-Za-z\s-]+$', user_in.fullname):
            raise ValueError("Fullname должен содержать только буквы, пробелы и дефисы.")
    if len(user_in.password1) > 20:
            raise ValueError("Пароль должен быть не длиннее 20 символов.")
    user = await UserModel.create(
        fullname = user_in.fullname, login=user_in.login, password=bcrypt.hash(user_in.password1)
    )
    

    return {"access_token": await create_token(user)}




@router.post("/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.fullname, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid email or password",
        )

    return {"access_token": await create_token(user)}



   
@router.get("/board")
async def get_board(user: User = Depends(get_current_user)): # type: ignore
    user = await UserModel.get(id=user.id)

    return {"board": user.board}


@router.put("/board")
async def save_board(board: Board, user: User = Depends(get_current_user)): # type: ignore
    user = await UserModel.get(id=user.id)
    user.board = board.json()
    await user.save()

    return {"message": "success"}


@router.post("/Task")
async def create_task(task_data: TaskCreateRequest, user: User = Depends(get_current_user)):  # type: ignore
    """`task_data`: Данные задачи (`title`, `description`, `column_id`)"""
    try:
        task = await Task.create(
            title=task_data.title,
            description=task_data.description,
            author_id=user.id,
            assignee_id=user.id,
            column_id=task_data.column_id
        )
        return {"task": task}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating task: {str(e)}"
        )

@router.post("/task")
async def save_task(task: Task, user: User = Depends(get_current_user)):
    user = await UserModel.get(id=user.id)
    user.task = task.json()
    await user.save()
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail= "".join(map(str, task)) + ", " + str(user)         # 422
    )
    # тут че то надо сделать
    return {"message": "success"}



@router.get("/Task/{task_id}")
async def get_task(task_id: str, user: User = Depends(get_current_user)):   # type: ignore
    try:
        # Ищем задачу по её ID
        task = await Task.get(id=task_id)
        if task.author_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this task",
            )
        return {"task": task}
    except Task.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )




# обращение к task'ам get & put, задавать значения position относительно тасков 