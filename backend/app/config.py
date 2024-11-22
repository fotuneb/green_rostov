from pydantic import BaseSettings


class Settings(BaseSettings):
    postgres_username: str
    postgres_password: str
    postgres_host: str
    postgres_port: int
    postgres_dbname: str
    jwt_secret: str
    secret_key: str
    bot_name: str


settings = Settings()
