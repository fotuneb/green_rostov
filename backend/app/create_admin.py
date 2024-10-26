import asyncio
from tortoise import Tortoise
from user.models_user import UserModel
from config import settings
from passlib.hash import bcrypt

async def create_admin():
    postgres_url = "postgres://{username}:{password}@{host}:{port}/{dbname}".format(
        username=settings.postgres_username,
        password=settings.postgres_password,
        host=settings.postgres_host,
        port=settings.postgres_port,
        dbname=settings.postgres_dbname,
    )

    await Tortoise.init(
        db_url=postgres_url,
        modules={"models": ["user.models_user"]}
    )
    await Tortoise.generate_schemas()

    password = "admin"  # Задайте пароль для администратора
    hashed_password = bcrypt.hash(password)
    
    admin_user = await UserModel.create(
        fullname="Admin User",
        login="admin",
        password=hashed_password,
        role="admin"
    )
    
    print("Admin user created:", admin_user.fullname, admin_user.login, admin_user.role)
    await Tortoise.close_connections()

asyncio.run(create_admin())
