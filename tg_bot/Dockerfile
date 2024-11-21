FROM python:3.10

ENV PYTHONUNBUFFERED 1
WORKDIR /app/bot

COPY requirements.txt .

RUN pip install -r requirements.txt


COPY . .

CMD ["python", "main.py"]
