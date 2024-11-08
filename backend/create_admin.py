# app/scripts/create_admin.py
import asyncio
import time
from app.user.models_user import UserModel
from app.config import settings
from tortoise import Tortoise, run_async
from passlib.hash import bcrypt
import asyncpg


async def wait_for_db():
    while True:
        try:
            conn = await asyncpg.connect(
                user=settings.postgres_username,
                password=settings.postgres_password,
                database=settings.postgres_dbname,
                host=settings.postgres_host,
                port=settings.postgres_port,
            )
            await conn.close()
            print("Database is ready.")
            break
        except Exception as e:
            print("Waiting for database to be ready...")
            time.sleep(2)

async def create_admin():
    await wait_for_db()
    await Tortoise.init(
        db_url=f"postgres://{settings.postgres_username}:{settings.postgres_password}@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_dbname}",
        modules={"models": ["app.user.models_user"]}
    )
    await Tortoise.generate_schemas()
    
    admin = await UserModel.filter(role="admin").first()
    if not admin:
        hashed_password = bcrypt.hash("admin_password")
        admin = await UserModel.create(
            fullname="Admin User",
            login="admin",
            password=hashed_password,
            role="admin",
            about="System administrator"
        )
        print("Admin user created.")
    else:
        print("Admin user already exists.")
    
    await Tortoise.close_connections()

# Запуск функции
run_async(create_admin())










































"""import asyncio
from tortoise import Tortoise
from app.user.models_user import UserModel
from app.config import settings
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
        modules={"models": ["app.user.models_user"]}
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

asyncio.run(create_admin())"""
