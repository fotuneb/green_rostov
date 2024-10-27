# Кейс Вебпрактик

## Установка

### Первый этап
Клонирование репозитория и .env файла
```
git clone git@github.com:fotuneb/green_rostov.git
cd green_rostov
cp .env.example .env
```

По желанию можете настроить .env файл (например, для указания внешнего URL)

### Второй этап
Далее нужно просто композ. 
```
docker compose up -d
```

## Использование
Сайт доступен по протоколу HTTP. Swagger доступен по порту 8000 на эндпоинте /api/docs
