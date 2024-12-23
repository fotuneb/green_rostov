import openpyxl
from openpyxl import Workbook
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Form, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN
from tortoise.transactions import in_transaction
from tortoise.exceptions import DoesNotExist
from app.user.authentication import get_privileged_user
from app.user.models_user import UserModel
from app.task.models import Column, Task, Comments, Attachment
from app.task.schemas import ObjectRenameInfo, Column_drag, TaskPublicInfo, Task_for_desc, Task_change_resposible, Task_Drag, CommentPublicInfo, ChangeCommentInfo
from app.task.tg_http import notify_new_assignee, send_deadline_notification
from pydantic import BaseModel
import os
import uuid
from app.task.util import validate_image_file, convert_to_local_timezone
from openpyxl.drawing.image import Image as OpenpyxlImage
from PIL import Image
import io
from starlette.background import BackgroundTask
from app.user.tracker_for_time.models import Tracker



router = APIRouter()


# возвращается id и index
@router.put("/api/column")
async def create_column(title: str, current_user: UserModel = Depends(get_privileged_user)):
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
async def delete_column(id: int, current_user: UserModel = Depends(get_privileged_user)):
    try:
        column = await Column.get(id=id)
        await column.delete()
        return {"id": id}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")



# возвращается ok 200
@router.post("/api/column/rename/{info.id}")
async def rename_column(info: ObjectRenameInfo, current_user: UserModel = Depends(get_privileged_user)):
    try:
        column = await Column.get(id=info.id)
        column.title = info.new_title
        await column.save()
        return {"title": column.title}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")

# возвращается status ok 200
@router.put("/api/columns/move")
async def move_column(ColumnInfoDrag: Column_drag, current_user: UserModel = Depends(get_privileged_user)):
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



@router.get("/api/tasks")
async def get_tasks():
    tasks = await Task.all()  # Получаем все задачи

    task_list = []
    for task in tasks:
        # Добавляем задачу с вложениями в список
        task_list.append({
            "id": task.id,
            "title": task.title,
            "index": task.index,
            "author": task.author_id,
            "assignee": task.assignee_id,
            "column_id": task.column_id, 

        })

    return task_list



@router.get("/api/task/{task_id}")
async def get_task_using_id(task_id: int):
    task = await Task.get_or_none(id=task_id)

    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")
    
    
    trackings = await Tracker.filter(task=task_id)
    total_tracked_time = 0
    for tracking in trackings:
        total_tracked_time += tracking.track_amount
    
    # Получаем список вложений, связанных с задачей
    attachments = await task.attachments.all()  # Получаем все вложения, связанные с задачей

    # Формируем список вложений
    attachment_list = [{"id": attachment.id, "file_path": attachment.file_path, "uploaded_at": attachment.get_local_uploaded_at()} for attachment in attachments]

    return {
        "id": task.id,
        "title": task.title,
        "index": task.index,
        "description": task.description,
        "author": task.author_id,
        "assignee": task.assignee_id,
        "column": task.column_id,
        "created_at": convert_to_local_timezone(task.created_at),
        "updated_at": convert_to_local_timezone(task.updated_at),
        "deadline":convert_to_local_timezone(task.deadline),                                   # +
        "total_tracked_time": total_tracked_time,
        "attachments": attachment_list  # Добавляем список вложений
    }

# вывод всех колонок 
@router.get("/api/columns")
async def get_columns():
    column = await Column.all()
    return column

# возвращается id и индекс; содерджимое (description) изначально пусто
@router.put("/api/task")
async def create_task(TaskInfo: TaskPublicInfo, current_user: UserModel = Depends(get_privileged_user)):
    tasks_exist = await Task.exists()
    if tasks_exist:
        # Если колонки существуют, находим максимальный индекс
        max_index_record = await Task.all().order_by("-index").values("index")
        max_index = max_index_record[0]["index"] if max_index_record else 0
        new_index = max_index + 1  # Увеличиваем индекс на 1
    else:
        # Если колонок нет, устанавливаем индекс в 0
        new_index = 0

    current_column = await Column.get(id=TaskInfo.id_column)    # + 


    task = await Task.create(
        index = new_index,
        title = TaskInfo.title,
        description = TaskInfo.description,
        author_id = current_user.id,
        assignee_id = current_user.id,
        column = current_column
    )
    assignee = await UserModel.get(id=current_user.id)
    if assignee.telegram_id and assignee.notifications:
        await notify_new_assignee(assignee.telegram_id, task, 'create_task')

    return {
        "id": task.id,  
        "index": task.index,
        "description": task.description,
        "author": task.author_id,
        "assignee": task.assignee_id, 
        "column": task.column_id,
        "deadline":task.deadline,           # +
        
    }

# возвращается ok 200
@router.delete("/api/task/{id}")
async def delete_task(id: int, current_user: UserModel = Depends(get_privileged_user)):
    try:
        task = await Task.get(id=id)
        await task.delete()
        return {"id": id}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")


# возвращается ok 200
@router.post("/api/task/rename")
async def rename_task(info: ObjectRenameInfo, current_user: UserModel = Depends(get_privileged_user)):
    try:
        task = await Task.get(id=info.id)
        task.title = info.new_title
        await task.save()
        return {"title": task.title}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

# возвращается ok 200
@router.post("/api/task/change_contents")
async def change_task_content(TaskChangeInfo: Task_for_desc, current_user: UserModel = Depends(get_privileged_user)):
    try:
        task = await Task.get(id=TaskChangeInfo.id)
        task.description = TaskChangeInfo.desc
        await task.save()
        return {"description": task.description}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="description not found")

# отправка уведомления в тг при изменении
@router.post("/api/task/change_responsible/")
async def change_responsible(TaskChangeInfo: Task_change_resposible):
    try:
        task = await Task.get(id=TaskChangeInfo.id)
        task.assignee_id = TaskChangeInfo.id_user
        await task.save()
        new_assignee = await UserModel.get(id=TaskChangeInfo.id_user)   # + 
        if not new_assignee.telegram_id :
            return {"msg": "assignee updated successully, but new_assignee have not a tg"}
        elif new_assignee.notifications:
            await notify_new_assignee(new_assignee.telegram_id, task, "change_responsible")
        else:
            return {"msg": "user has disabled notifications"}
        return {"msg": "assignee updated successully"}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="User or Task not found")



# POST /api/task/move - поменять порядок (передаю id, столбец и индекс, в котором должна находиться таска, жду 200)
@router.put("/api/tasks/move")
async def move_task(TaskDragInfo: Task_Drag, current_user: UserModel = Depends(get_privileged_user)):
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


@router.post("/api/comments")
async def create_comment(CommentInfo: CommentPublicInfo, current_user: UserModel = Depends(get_privileged_user)):
    # проверка на существование задачи
    task = await Task.get_or_none(id=CommentInfo.id_task)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

    comment = await Comments.create(
        author_id = current_user.id,
        text = CommentInfo.text,
        task_id = CommentInfo.id_task
    )

    return {"id": comment.id,
            "author_id": comment.author_id,
            "create_date": convert_to_local_timezone(comment.create_date),
            "text": comment.text,
            "task_id": comment.task_id,
            "is_edited": comment.is_edited
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
        res = []
        for com in comments:
            res.append({
                "text": com.text,
                "is_edited": com.is_edited,
                "id": com.id,
                "author_id": com.author_id,
                "create_date": convert_to_local_timezone(com.create_date),
                "task_id": com.task_id
            })


        return res

    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")





# генерация эксель файла
@router.get("/export/board")
async def export_board_to_excel():
    columns = await Column.all().prefetch_related('column')
    if not columns:
        return "Не удалось экспортировать доску, проверьте, существует ли она"

    workbook = Workbook()
    workbook.remove(workbook.active)

    for column in columns:
        worksheet = workbook.create_sheet(title=column.title[:30])
        worksheet.append(["ID", "Название задачи", "Описание", "Автор", "Назначенный пользователь", "Дата создания", "Дата обновления"])

        tasks = await Task.filter(column=column.id).select_related("author", "assignee__avatar")
        for task in tasks:
            worksheet.append([
                task.id,
                task.title,
                task.description,
                task.author.fullname if task.author else "Не указано",
                task.assignee.fullname if task.assignee else "Не назначен",
                convert_to_local_timezone(task.created_at).strftime("%Y-%m-%d %H:%M:%S") if task.created_at else "Нет данных",
                convert_to_local_timezone(task.updated_at).strftime("%Y-%m-%d %H:%M:%S") if task.updated_at else "Нет данных"
            ])

    # Сохраняем файл в Docker volume
    filepath = f"/backend/uploads/board_export_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    
    workbook.save(filepath)
    def cleanup_file():
        if os.path.exists(filepath):
            os.remove(filepath)
    return FileResponse(
        filepath, 
        filename=filepath.split("/")[-1],  # Передаем только имя файла
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        background=BackgroundTask(cleanup_file)  # Указываем задачу для удаления
    )


@router.get("/api/tasks_tg")
async def get_user_tasks_for_tg(telegram_id: int):
    try:
        tasks = await Task.filter(assignee__telegram_id=telegram_id).prefetch_related("column").all()
        if not tasks:
            return {"tasks": []}

        task_list = [
            {"id":task.id, "title": task.title, "deadline": task.deadline,"column_name": task.column.title}
            for task in tasks
        ]

        return {"tasks": task_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения задач: {str(e)}")





@router.post("/api/avatar")
async def create_attachment_for_user(user_id: int, file: UploadFile):
    # Проверяем, что MIME-тип соответствует ожиданиям
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Only JPG and PNG files are allowed")

    # Проверка, существует ли задача
    try:
        user = await UserModel.get(id=user_id)
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="User not found")

    # Считываем содержимое файла
    file_bytes = await file.read()

    # Проверяем содержимое файла на допустимый формат
    if not validate_image_file(file_bytes):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid image format")

       # Открываем изображение с помощью Pillow
    try:
        image = Image.open(io.BytesIO(file_bytes))
    except Exception as e:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=f"Error processing image: {str(e)}")

    # Определяем фильтр для ресайза
    try:
        resampling_filter = Image.Resampling.LANCZOS  # Для новых версий Pillow
    except AttributeError:
        resampling_filter = Image.ANTIALIAS  # Для старых версий Pillow

    # Сжимаем изображение до 256x256
    image = image.convert("RGB")  # Приводим изображение к RGB (на случай PNG с альфа-каналом)
    image = image.resize((256, 256), resampling_filter)

    # Генерируем уникальное имя файла с сохранением расширения
    unique_filename = f"{uuid.uuid4()}.jpg"  # Сохраняем как JPEG
    file_path = os.path.join("/backend/uploads", unique_filename)
    # Сохраняем сжатое изображение на диск
    try:
        image.save(file_path, "JPEG")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving compressed image: {str(e)}")


    # Удаляем старую аватарку, если она есть
    if user.avatar:
        try:
            old_attachment = await user.avatar
            os.remove(old_attachment.file_path)  # Удаляем файл с сервера
            await old_attachment.delete()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting old avatar: {str(e)}")

    # Создаем новую запись вложения
    attachment = await Attachment.create(file_path=file_path)

    # Обновляем аватарку пользователя
    user.avatar_id = attachment.id
    await user.save(update_fields=["avatar_id"])  # Указываем поле для обновления

    return {"id": attachment.id, "file_path": attachment.file_path}


@router.get("/api/attachments")
async def get_attachments():
    attachments = await Attachment.all()
    # print(attachments[0].uploaded_at, "\n", attachments[0].get_local_uploaded_at())
    res = []
    for at in attachments:
        res.append({
            "id": at.id,
            "file_path": at.file_path,
            "uploaded_at": convert_to_local_timezone(at.uploaded_at)
        })
    
    return res


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





@router.get("/api/attachments/{attachment_id}")
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

#Для тг-бота
@router.get("/api/tasks/deadline")
async def get_upcoming_deadlines():
    try:
        now = datetime.now()
        deadline_threshold = now + timedelta(days=2)
        tasks = await Task.all().filter(
            deadline__gte=now, deadline__lte=deadline_threshold
        ).select_related("assignee").order_by("deadline")
        result = []
        for task in tasks:
            if task.assignee and task.assignee.telegram_id:
                result.append({
                    "title": task.title,
                    "deadline": task.deadline,
                    "telegram_id": task.assignee.telegram_id,
                })
        return result
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Tasks doesnt collected")
#Для тг-бота
@router.get("/api/task_tg/{task_id}")
async def get_task_tg_id(task_id: int):
    task = await Task.get_or_none(id=task_id).prefetch_related("column", "author")

    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

    comments = await Comments.filter(task_id=task_id).prefetch_related("author")

    comment_list = [{
        "id": comment.id,
        "author": comment.author.fullname if comment.author else "Неизвестный пользователь",
        "text": comment.text,
        "create_date": comment.create_date
    } for comment in comments]

    return {
        "id": task.id,
        "title": task.title,
        "index": task.index,
        "description": task.description,
        "author": task.author.fullname if task.author else "Неизвестный пользователь",
        "column": task.column_id,
        "column_name": task.column.title,  # Название колонки
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "deadline": task.deadline,
        "comments": comment_list
    }

@router.get("/api/comments/{id}")
async def get_comment_by_id(id: int):
    comment = await Comments.get_or_none(id=id)
    if not comment:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Comment not found")

    return {"text": comment.text}

@router.post("/api/comments/{id}")
async def change_comment_description(info: ChangeCommentInfo, current_user: UserModel = Depends(get_privileged_user)):
    comment = await Comments.get_or_none(id=info.id, author_id = current_user.id)
    if not comment:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Comment not found")
    
    comment.text = info.new_text
    comment.is_edited = True
    await comment.save()

    return {"status": "ok", 'is_edited': comment.is_edited}