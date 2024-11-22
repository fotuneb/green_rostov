



# Функция проверки формата файла по первым байтам
def validate_image_file(file_bytes: bytes) -> bool:
    # Проверяем на PNG (первые 8 байт) и JPEG (первые 2 байта)
    png_signature = b"\x89PNG\r\n\x1a\n"
    jpeg_signature = b"\xff\xd8"
    return file_bytes.startswith(png_signature) or file_bytes.startswith(jpeg_signature)


