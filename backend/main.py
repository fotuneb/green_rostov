from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import aiohttp

from app.config import settings
from app.user.routes_user import router1
from app.task.routes import router
from app.user.tracker_for_time.routes import router2
from app.task.tg_http import notify_upcoming_deadlines
from app.user.routes_user import admin_router
import app.task.routes_for_time


def create_app() -> FastAPI:
    application = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

    application.include_router(router, prefix="")
    application.include_router(router1, prefix="")
    application.include_router(router2, prefix="")
    application.include_router(admin_router, prefix="")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    postgres_url = "postgres://{username}:{password}@{host}:{port}/{dbname}".format(
        username=settings.postgres_username,
        password=settings.postgres_password,
        host=settings.postgres_host,
        port=settings.postgres_port,
        dbname=settings.postgres_dbname,
    )

    register_tortoise(
        application,
        db_url=postgres_url,
        modules={"models": ["app.user.models_user", "app.task.models", "app.task.attachment_model", "app.user.tracker_for_time.models"]},
        generate_schemas=True,
        add_exception_handlers=True,
    )

    return application

app = create_app()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(notify_upcoming_deadlines())