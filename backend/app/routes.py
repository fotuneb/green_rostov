from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt

from app.authentication import authenticate_user, create_token, get_current_user
from app.models import UserModel
from app.schemas import Board, User, UserIn

router = APIRouter()


@router.get("/board")
async def get_board(user: User = Depends(get_current_user)):
    user = await UserModel.get(id=user.id)

    return {"board": user.board}


@router.put("/board")
async def save_board(board: Board, user: User = Depends(get_current_user)):
    user = await UserModel.get(id=user.id)
    user.board = board.json()
    await user.save()

    return {"message": "success"}


@router.post("/users")
async def create_user(user_in: UserIn):
    if not user_in.password1 == user_in.password2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords don't match"
        )

    user = await UserModel.create(
        email=user_in.email, password=bcrypt.hash(user_in.password1)
    )

    return {"access_token": await create_token(user)}


@router.post("/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return {"access_token": await create_token(user)}
