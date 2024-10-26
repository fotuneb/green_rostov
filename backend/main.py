from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import router


def create_app() -> FastAPI:
    application = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

    application.include_router(router, prefix="/api")
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
        modules={"models": ["app.models_user"]},
        generate_schemas=True,
        add_exception_handlers=True,
    )

    return application


app = create_app()
