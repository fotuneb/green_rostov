FROM python:3.10

ENV PYTHONUNBUFFERED 1
WORKDIR /app/api

COPY requirements.txt .
# RUN apk add gcc libc-dev libffi-dev libpq-dev python3-dev
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

ENTRYPOINT ["sh", "-c", "python create_admin.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
