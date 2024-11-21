import openpyxl
from openpyxl import Workbook
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Form, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN
from tortoise.transactions import in_transaction
from tortoise.exceptions import DoesNotExist
from app.user.authentication import get_current_user
from app.user.models_user import UserModel
from app.task.models import Column, Task, Comments, Attachment
from app.task.schemas import Rename, Column_drag, TaskPublicInfo, Task_for_desc, Task_change_resposible, Task_Drag, CommentPublicInfo
import pandas
from pydantic import BaseModel
import base64
import os




router = APIRouter()


# возвращается id и index
@router.put("/api/column")
async def create_column(title: str, current_user: UserModel = Depends(get_current_user)):
    # проверка на текущего пользователя
    if current_user.role == "guest":
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="You haven't sufficient permission")

    columns_exist = await Column.exists()
    if columns_exist:
        max_index_record = await Column.all().order_by("-index").values("index")
        max_index = max_index_record[0]["index"] if max_index_record else 0
        new_index = max_index + 1 # Увеличиваем индекс на 1
    else:
        # Если колонок нет, устанавливаем индекс в 0
        new_index = 0

    # Создайте новый столбец
    column = await Column.create(title=title, index=new_index)

    return {"id": column.id, 
            "index": column.index,
            "title": column.title
    }


# возвращается HTTP STATUS 200 OK в случае успеха
@router.delete("/api/column/{id}")
async def delete_column(id: int):
    try:
        column = await Column.get(id=id)
        await column.delete()
        return {"id": id}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")



# возвращается ok 200
@router.post("/api/column/rename/{info.id}")
async def rename_column(info: Rename):
    try:
        column = await Column.get(id=info.id)
        column.title = info.new_title
        await column.save()
        return {"title": column.title}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")



# [+] realisation drag-n-drop for column

# возвращается status ok 200
@router.put("/api/columns/{ColumnInfoDrag.column_id}/move")
async def move_column(ColumnInfoDrag: Column_drag):
    async with in_transaction() as conn:
        # Получаем колонку, которую необходимо переместить
        column = await Column.get_or_none(id=ColumnInfoDrag.column_id)
        if not column:
            raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")

        old_index = column.index

        if old_index < ColumnInfoDrag.new_index:
            # Перемещение вниз: уменьшаем индексы между старым и новым положением
            columns_to_shift = await Column.filter(index__gt=old_index, index__lte=ColumnInfoDrag.new_index)
            for c in columns_to_shift:
                c.index -= 1
                await c.save(using_db=conn)
        elif old_index > ColumnInfoDrag.new_index:
            # Перемещение вверх: увеличиваем индексы между новым и старым положением
            columns_to_shift = await Column.filter(index__gte=ColumnInfoDrag.new_index, index__lt=old_index)
            for c in columns_to_shift:
                c.index += 1
                await c.save(using_db=conn)

        # Обновляем индекс колонки
        column.index = ColumnInfoDrag.new_index
        await column.save(using_db=conn)

    return {"success": True, "new_index": column.index}





@router.get("/api/tasks/")
async def get_tasks():
    tasks = await Task.all()  # Получаем все задачи

    task_list = []
    for task in tasks:
        # Получаем вложения для каждой задачи
        attachments = await task.attachments.all()  # Получаем все вложения для текущей задачи

        # Формируем список вложений
        attachment_list = [{"id": attachment.id, "file_path": attachment.file_path, "uploaded_at": attachment.uploaded_at} for attachment in attachments]

        # Добавляем задачу с вложениями в список
        task_list.append({
            "id": task.id,
            "title": task.title,
            "index": task.index,
            "description": task.description,
            "author": task.author_id,
            "assignee": task.assignee_id,
            "column": task.column_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "attachments": attachment_list  # Добавляем вложения в задачу
        })

    return task_list



@router.get("/api/task/{task_id}")
async def get_task_using_id(task_id: int):
    task = await Task.get_or_none(id=task_id)

    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

    # Получаем список вложений, связанных с задачей
    attachments = await task.attachments.all()  # Получаем все вложения, связанные с задачей

    # Формируем список вложений
    attachment_list = [{"id": attachment.id, "file_path": attachment.file_path, "uploaded_at": attachment.uploaded_at} for attachment in attachments]

    return {
        "id": task.id,
        "title": task.title,
        "index": task.index,
        "description": task.description,
        "author": task.author_id,
        "assignee": task.assignee_id,
        "column": task.column_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "attachments": attachment_list  # Добавляем список вложений
    }


# вывод всех колонок 
@router.get("/api/columns")
async def get_columns():
    column = await Column.all()
    return column




# [+] создание task'a

# возвращается id и индекс; содерджимое (description) изначально пусто
@router.put("/api/task")
async def create_task(TaskInfo: TaskPublicInfo):
    tasks_exist = await Task.exists()
    if tasks_exist:
        # Если колонки существуют, находим максимальный индекс
        max_index_record = await Task.all().order_by("-index").values("index")
        max_index = max_index_record[0]["index"] if max_index_record else 0
        new_index = max_index + 1  # Увеличиваем индекс на 1
    else:
        # Если колонок нет, устанавливаем индекс в 0
        new_index = 0

    current_column = await Column.get(id=TaskInfo.id_column)


    task = await Task.create(
        index = new_index,
        title = TaskInfo.title,
        description = TaskInfo.description,
        author_id = TaskInfo.id_user,
        assignee_id = TaskInfo.id_user,
        column = current_column
    )

    return {
        "id": task.id,  
        "index": task.index,
        "description": task.description,
        "author": task.author_id,
        "assignee": task.assignee_id, 
        "column": task.column_id
    }




# возвращается ok 200
@router.delete("/api/task/{id}")
async def delete_task(id: int):
    try:
        task = await Task.get(id=id)
        await task.delete()
        return {"id": id}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")



# POST /api/task/rename - переименовать (передаю id и новое название, жду 200)
# возвращается ok 200
@router.post("/api/task/rename/{info.id}")
async def rename_task(info: Rename):
    try:
        task = await Task.get(id=info.id)
        task.title = info.new_title
        await task.save()
        return {"title": task.title}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")





# POST /api/task/change_contents - изменить содержимое (как выше, но текст)
# возвращается ok 200
@router.post("/api/task/change_contents/{id}")
async def change_task_content(TaskChangeInfo: Task_for_desc):
    try:
        task = await Task.get(id=TaskChangeInfo.id)
        task.description = TaskChangeInfo.desc
        await task.save()
        return {"description": task.description}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="description not found")





# POST /api/task/change_responsible - изменить ответственного (передается id пользователя, ожидаю 200)
# ожидаю 200
@router.post("/api/task/change_responsible/{TaskChangeInfo.id}")
async def change_responsible(TaskChangeInfo: Task_change_resposible):
    try:
        task = await Task.get(id=TaskChangeInfo.id)
        task.assignee_id = TaskChangeInfo.id_user
        await task.save()
        return {"msg": "assignee updated successully"}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="User or Task not found")



# POST /api/task/move - поменять порядок (передаю id, столбец и индекс, в котором должна находиться таска, жду 200)
@router.put("/api/tasks/{TaskDragInfo.task_id}/move")
async def move_task(TaskDragInfo: Task_Drag):
    async with in_transaction() as conn:
        # Получаем задачу, которую необходимо переместить
        task = await Task.get_or_none(id=TaskDragInfo.task_id)
        if not task:
            raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

        old_column_id = task.column_id
        old_index = task.index

        # Если перемещение происходит внутри той же колонки
        if old_column_id == TaskDragInfo.new_column_id:
            if old_index < TaskDragInfo.new_index:
                # Перемещение вниз: увеличиваем индексы между старым и новым положением
                tasks_to_shift = await Task.filter(column_id=TaskDragInfo.new_column_id, index__gt=old_index, index__lte=TaskDragInfo.new_index)
                for t in tasks_to_shift:
                    t.index -= 1
                    await t.save(using_db=conn)
            elif old_index > TaskDragInfo.new_index:
                # Перемещение вверх: уменьшаем индексы между новым и старым положением
                tasks_to_shift = await Task.filter(column_id=TaskDragInfo.new_column_id, index__gte=TaskDragInfo.new_index, index__lt=old_index)
                for t in tasks_to_shift:
                    t.index += 1
                    await t.save(using_db=conn)

        else:
            # Перемещение в другую колонку
            tasks_to_shift_old = await Task.filter(column_id=old_column_id, index__gt=old_index)
            for t in tasks_to_shift_old:
                t.index -= 1
                await t.save(using_db=conn)

            tasks_to_shift_new = await Task.filter(column_id=TaskDragInfo.new_column_id, index__gte=TaskDragInfo.new_index)
            for t in tasks_to_shift_new:
                t.index += 1
                await t.save(using_db=conn)

            task.column_id = TaskDragInfo.new_column_id

        # Обновляем индекс задачи
        task.index = TaskDragInfo.new_index
        await task.save(using_db=conn)

    return {"success": "ok"}


    

# POST /api/task/comments/ создать (передается text, user_id, task_id, возвращается id коммента)
@router.post("/api/comments")
async def create_comment(CommentInfo: CommentPublicInfo):
    # проверка на существование задачи
    task = await Task.get_or_none(id=CommentInfo.id_task)
    # проверка на текущего пользователя
    temp_user = await UserModel.get_or_none(id=CommentInfo.id_user)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")
    
    if not temp_user:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="User not found")
    elif temp_user.role == "guest":
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="You haven't sufficient permission")
    

    comment = await Comments.create(
        author_id = CommentInfo.id_user,
        text = CommentInfo.text,
        task_id = CommentInfo.id_task
    )
    return {"id": comment.id,
            "author_id": comment.author_id,
            "create_date": comment.create_date,
            "text": comment.text,
            "task_id": comment.task_id
    }


# возвращается ok 200
@router.delete("/api/comments/{id}")
async def delete_comment(id: int):
    try:
        comment = await Comments.get(id=id)
        await comment.delete()
        return {"id": id}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Comment not found")


@router.get("/api/comments")
async def get_comments(task_id: int):
    try:
        # Извлекаем комментарии, связанные с задачей
        comments = await Comments.filter(task_id=task_id).prefetch_related("author")
        
        # Проверяем, найдены ли комментарии
        if not comments:
            raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Comments not found")

        # Возвращаем список комментариев
        return comments     # !!!       передается также еще и описание, нужно изменить 

    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")





# генерация эксель файла
@router.get("/export/board")
async def export_board_to_excel():
    # Получаем все колонки с задачами
    columns = await Column.all().prefetch_related('column')
    if not columns:
        return "Не удалось экспортировать доску, проверьте, существует ли она"
    # Создаем новый Excel-файл
    workbook = Workbook()
    workbook.remove(workbook.active)  # Удаляем стандартный пустой лист
    
    for column in columns:
        # Создаем лист для каждой колонки
        worksheet = workbook.create_sheet(title=column.title[:30])  # Ограничиваем название до 30 символов
        worksheet.append(["ID", "Название задачи", "Описание", "Автор", "Назначенный пользователь", "Дата создания", "Дата обновления"])

        # Добавляем задачи на лист
        tasks = await Task.filter(column=column.id).prefetch_related("author", "assignee")
        for task in tasks:
            worksheet.append([
                task.id,
                task.title,
                task.description,
                task.author.fullname if task.author else "Не указано",
                task.assignee.fullname if task.assignee else "Не назначен",
                task.created_at.strftime("%Y-%m-%d %H:%M:%S") if task.created_at else "Нет данных",
                task.updated_at.strftime("%Y-%m-%d %H:%M:%S") if task.updated_at else "Нет данных"
            ])

    # Сохраняем файл
    #filename = f"board_export_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    filepath = f"board_export_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    
    workbook.save(filepath)
    return FileResponse(filepath, filename=filepath, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")






# Функция проверки формата файла по первым байтам
def validate_image_file(file_bytes: bytes) -> bool:
    # Проверяем на PNG (первые 8 байт) и JPEG (первые 2 байта)
    png_signature = b"\x89PNG\r\n\x1a\n"
    jpeg_signature = b"\xff\xd8"
    return file_bytes.startswith(png_signature) or file_bytes.startswith(jpeg_signature)





@router.post("/api/attachments/")
async def create_attachment(task_id: int, file: UploadFile):
    # Проверяем, что MIME-тип соответствует ожиданиям
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Only JPG and PNG files are allowed")

    # Проверка, существует ли задача
    try:
        task = await Task.get(id=task_id)
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

    # Считываем содержимое файла
    file_bytes = await file.read()

    # Проверяем содержимое файла на допустимый формат
    if not validate_image_file(file_bytes):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid image format")

    # Генерируем уникальный путь для файла
    upload_dir = os.path.join("uploads", str(task_id))  # Директория для конкретной задачи
    os.makedirs(upload_dir, exist_ok=True)  # Создаем директорию, если её нет

    file_path = os.path.join(upload_dir, file.filename)

    # Сохраняем файл
    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    # Создаем запись о вложении
    attachment = await Attachment.create(file_path=file_path, task=task)

    # Привязываем вложение к задаче через связь Many-to-Many
    await task.attachments.add(attachment)

    return {"id": attachment.id, "file_path": attachment.file_path}



@router.get("/api/attachments/")
async def get_attachments():
    attachments = await Attachment.all()
    return attachments


@router.delete("/api/attachments/{attachment_id}")
async def delete_attachment(attachment_id: int):
    # Находим вложение по id
    try:
        attachment = await Attachment.get(id=attachment_id)
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Attachment not found")

    # Проверяем, существует ли файл
    if os.path.exists(attachment.file_path):
        try:
            os.remove(attachment.file_path)  # Удаляем файл с сервера
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
    else:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="File not found on server")

    # Удаляем запись о вложении из базы данных
    try:
        await attachment.delete()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting attachment record: {str(e)}")

    return {"message": "Attachment deleted successfully"}





@router.get("/api/attachments/{attachment_id}/")
async def create_url_for_file(attachment_id: int):
    # Ищем вложение по id
    try:
        attachment = await Attachment.get(id=attachment_id)
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Attachment not found")

    # Получаем путь к файлу
    file_path = attachment.file_path

    # Проверяем, существует ли файл
    if not os.path.exists(file_path):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="File not found on server")

    # Определяем MIME-тип на основе расширения файла
    mime_type = "image/jpeg" if file_path.endswith((".jpg", ".jpeg")) else "image/png"

    # Возвращаем файл с указанным MIME-типом
    return FileResponse(file_path, media_type=mime_type)
