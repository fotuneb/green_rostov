from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.hash import bcrypt
import re
from app.user.authentication import authenticate_user, create_token, get_current_user, get_admin_user,generate_telegram_link
from app.user.models_user import UserModel
from app.user.schemas_user import User, UserIn, UserPublicInfo, UserPasswordSchema

router1 = APIRouter()
admin_router = APIRouter()

@admin_router.post("/api/users/admin/change-role/{user_id}")
async def change_role(user_id: int, new_role: str, admin_user: UserModel = Depends(get_admin_user)):
    user = await UserModel.get(id=user_id)
    user.role = new_role
    await user.save()
    return {"msg": "Role updated successfully"}

@admin_router.post("/api/users/admin/change-fullname/{user_id}")
async def change_fullname(user_id: int, new_fullname: str, admin_user: UserModel = Depends(get_admin_user)):
    user = await UserModel.get(id=user_id)
    if not re.fullmatch(r"[A-Za-zА-Яа-яёЁ\s\-]+", new_fullname):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Fullname должен содержать только буквы, пробелы и дефисы.",
        )
    user.fullname = new_fullname
    await user.save()
    return {"msg": "Role updated successfully"}

@admin_router.post("/api/users/admin/change-password/{user_id}")
async def change_password(user_id: int, new_password: str, admin_user: UserModel = Depends(get_admin_user)):
    user = await UserModel.get(id=user_id)
    if len(new_password) > 20:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пароль должен быть не длиннее 20 символов.",
        )
    user.password = bcrypt.hash(new_password)
    await user.save()
    return {"msg": "Role updated successfully"}

@router1.get("/api/get_users")
async def get_users():
    users = await UserModel.all().values("id", "fullname", "role", "avatar_id")
    return users

@router1.get("/api/get_user/{user_id}")
async def get_user(user_id: int):  
    user = await UserModel.get(id=user_id).values("fullname", "role", "about", "avatar_id")
    return user

@router1.post("/api/users")
async def create_user(user_in: UserIn):
    
    if not re.fullmatch(r"[A-Za-zА-Яа-яёЁ\s\-]+", user_in.fullname):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Fullname должен содержать только буквы, пробелы и дефисы.",
        )
    if len(user_in.password1) > 20:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пароль должен быть не длиннее 20 символов.",
        )
    if await UserModel.filter(login=user_in.login).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Логин уже существует. Пожалуйста, выберите другой.",
        )
    user = await UserModel.create(
        fullname = user_in.fullname, login=user_in.login, password=bcrypt.hash(user_in.password1)
    )
    

    return {"access_token": await create_token(user)}

@router1.post("/api/users/change-info")
async def change_about(user_info: UserPublicInfo, current_user: UserModel = Depends(get_current_user)):
    user = await UserModel.get(id=current_user.id)

    user.about = user_info.about
    user.fullname = user_info.fullname

    await user.save()
    return {"msg": "About updated successfully"}

@router1.post("/api/users/change-password")
async def change_password(password_data: UserPasswordSchema, current_user: UserModel = Depends(get_current_user)):
    user = await UserModel.get(id=current_user.id)
    
    if not user.verify_password(password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Текущий пароль введен неправильно!",
        )

    user.password = bcrypt.hash(password_data.new_password)
    await user.save()

    return {"msg": "Пароль успешно изменен"}


@router1.post("/api/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid email or password",
        )

    return {"access_token": await create_token(user), "id": user.id, "role": user.role}

@router1.get("/api/tg-link/{user_id}")
async def generate_tg_link(user_id: int):
    user = await UserModel.get(id=user_id)
    if not user:
        return {"error": "Пользователь не найден"}
    return {"telegram_link": await generate_telegram_link(user.id)}

# используется у тг-бота
@router1.post("/api/link_telegram")
async def link_telegram(data: dict):
    user_id = data.get("user_id")
    telegram_id = data.get("telegram_id")

    user = await UserModel.filter(id=user_id).first()
    if not user:
        return {"status": "error", "message": "Пользователь не найден"}

    user.telegram_id = telegram_id
    await user.save()
    return {"status": "nice", "message": "Телеграмм успешно подключен"}

# используется у тг-бота
@router1.get("/api/check_telegram_link/{telegram_id}")
async def check_telegram_link(telegram_id: int):
    user = await UserModel.filter(telegram_id=telegram_id).first()
    if user.telegram_id:
        return {"telegram_id": user.telegram_id, "username": user.fullname}
    return {"telegram_id": None, "username": None}

# используется у тг-бота
@router1.get("/api/user/notifications_get/{telegram_id}")
async def get_user_notifications(telegram_id: int):
    user = await UserModel.filter(telegram_id=telegram_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")
    return {"notifications": user.notifications}

# используется у тг-бота
@router1.post("/api/user/notifications_update/{telegram_id}")
async def update_user_notifications(telegram_id: int, data: dict):
    user = await UserModel.filter(telegram_id=telegram_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")
    
    notifications = data.get("notifications")
    if notifications is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid data")
    
    user.notifications = notifications
    await user.save()
    return {"status": "success"}


