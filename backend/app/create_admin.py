import asyncio
from passlib.hash import bcrypt
from app.user.models_user import UserModel
from tortoise import Tortoise

async def create_admin():
    await Tortoise.init(
        db_url="postgres://{username}:{password}@{host}:{port}/{dbname}".format(
            username="your_username",
            password="your_password",
            host="localhost",
            port=5432,
            dbname="your_dbname"
        ),
        modules={"models": ["app.user.models_user"]}
    )
    await Tortoise.generate_schemas()

    password = "admin"  # Задайте пароль для администратора
    hashed_password = bcrypt.hash(password)
    
    # Создаём пользователя с ролью "admin"
    admin_user = await UserModel.create(
        fullname="Admin User",
        login="admin",
        password=hashed_password,
        role="admin"
    )
    
    print("Admin user created:", admin_user.fullname, admin_user.login, admin_user.role)
    await Tortoise.close_connections()

# Запускаем асинхронный скрипт
asyncio.run(create_admin())
