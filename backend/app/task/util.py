from datetime import datetime, timezone, time
import pytz


# Функция проверки формата файла по первым байтам
def validate_image_file(file_bytes: bytes) -> bool:
    # Проверяем на PNG (первые 8 байт) и JPEG (первые 2 байта)
    png_signature = b"\x89PNG\r\n\x1a\n"
    jpeg_signature = b"\xff\xd8"
    return file_bytes.startswith(png_signature) or file_bytes.startswith(jpeg_signature)


def process_deadline(input_deadline: str) -> datetime:
    """
    Преобразует строку дедлайна '31.12.2024 23:00:00' в объект datetime для сохранения в базе данных.
    
    :param input_deadline: Строка с датой и временем в формате 'дд.мм.гггг чч:мм:сс'.
    :return: Объект datetime, совместимый с базой данных.
    """
    try:
        # Преобразуем строку в объект datetime
        deadline_datetime = datetime.strptime(input_deadline, "%d.%m.%Y %H:%M:%S")
        return deadline_datetime
    except ValueError as e:
        raise ValueError(
            f"Некорректный формат строки: '{input_deadline}'. "
            f"Ожидается формат 'дд.мм.гггг чч:мм:сс', например: '31.12.2024 23:00:00'."
        ) from e


def format_time(seconds: int) -> datetime:
    """Преобразует количество секунд в объект datetime.datetime с временем (HH:MM:SS)."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    # Создаём объект datetime с текущей датой и временем, соответствующим секундам
    return datetime.combine(datetime.today(), time(hour=hours, minute=minutes, second=seconds))


def datetime_to_seconds(dt: datetime) -> int:
    """
    Преобразует объект datetime в число секунд, прошедших с начала текущего года, месяца и дня.
    Если datetime не содержит информации о временной зоне, считается локальным временем.
    """
    if dt is None:
        return 0

    # Получаем начало текущего дня
    start_of_day = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=dt.tzinfo)

    # Если dt не содержит информацию о временной зоне
    if dt.tzinfo is None:
        start_of_day = start_of_day.replace(tzinfo=timezone.utc)
        dt = dt.replace(tzinfo=timezone.utc)

    # Возвращаем разницу между текущей датой и dt в секундах
    return int((dt - start_of_day).total_seconds())


# Пример преобразования времени в локальный часовой пояс
def convert_to_local_timezone(utc_time: datetime, timezone_str: str = "Europe/Moscow") -> datetime:
    local_tz = pytz.timezone(timezone_str)
    return utc_time.astimezone(local_tz)