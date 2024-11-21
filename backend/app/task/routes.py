import openpyxl
from openpyxl import Workbook
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN
from tortoise.transactions import in_transaction
from tortoise.exceptions import DoesNotExist
from app.user.authentication import get_current_user
from app.user.models_user import UserModel
from app.task.models import Column, Task, Comments
# from app.task.schemas import Task
import pandas
from pydantic import BaseModel

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
@router.post("/api/column/rename/{id}")
async def rename_column(id: int, new_title: str):
    try:
        column = await Column.get(id=id)
        column.title = new_title
        await column.save()
        return {"title": column.title}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")



# [+] realisation drag-n-drop for column

# возвращается status ok 200
@router.put("/api/columns/{column_id}/move")
async def move_column(column_id: int, new_index: int):
    async with in_transaction() as conn:
        # Получаем колонку, которую необходимо переместить
        column = await Column.get_or_none(id=column_id)
        if not column:
            raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")

        old_index = column.index

        if old_index < new_index:
            # Перемещение вниз: уменьшаем индексы между старым и новым положением
            columns_to_shift = await Column.filter(index__gt=old_index, index__lte=new_index)
            for c in columns_to_shift:
                c.index -= 1
                await c.save(using_db=conn)
        elif old_index > new_index:
            # Перемещение вверх: увеличиваем индексы между новым и старым положением
            columns_to_shift = await Column.filter(index__gte=new_index, index__lt=old_index)
            for c in columns_to_shift:
                c.index += 1
                await c.save(using_db=conn)

        # Обновляем индекс колонки
        column.index = new_index
        await column.save(using_db=conn)

    return {"success": True, "new_index": new_index}





# вывод всех задач
@router.get("/api/tasks")
async def get_tasks():
    tasks = await Task.all().values("id", "title", "index", "author_id", "assignee_id", "column_id", "created_at", "updated_at", "deadline","time_track")
    return tasks
    

@router.get("/api/task/{task_id}")
async def get_task_using_id(task_id: int):
    task = await Task.get_or_none(id=task_id)
    # if not task:      # !
    #     raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Column not found")
    
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
        "deadline":task.deadline,
        "time_track":task.time_track
    }

# вывод всех колонок 
@router.get("/api/columns")
async def get_columns():
    column = await Column.all()
    return column




# [+] создание task'a

# возвращается id и индекс; содерджимое (description) изначально пусто
@router.put("/api/task")
async def create_task(title: str, id_column: int, id_user: int):
    tasks_exist = await Task.exists()
    if tasks_exist:
        # Если колонки существуют, находим максимальный индекс
        max_index_record = await Task.all().order_by("-index").values("index")
        max_index = max_index_record[0]["index"] if max_index_record else 0
        new_index = max_index + 1  # Увеличиваем индекс на 1
    else:
        # Если колонок нет, устанавливаем индекс в 0
        new_index = 0

    current_column = await Column.get(id=id_column)
    # if not current_column:


    task = await Task.create(
        index = new_index,
        title = title,
        description = "",
        author_id = id_user,
        assignee_id = id_user,
        column = current_column
    )

    return {
        "id": task.id,  
        "index": task.index,
        "description": task.description,
        "author": task.author_id,
        "assignee": task.assignee_id, 
        "column": task.column_id,
        "deadline":task.deadline,
        "time_track":task.time_track
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
@router.post("/api/task/rename/{id}")
async def rename_task(id: int, new_title: str):
    try:
        task = await Task.get(id=id)
        task.title = new_title
        await task.save()
        return {"title": task.title}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")


# POST /api/task/change_contents - изменить содержимое (как выше, но текст)
# возвращается ok 200
@router.post("/api/task/change_contents/{id}")
async def change_task_content(id: int, desc: str):
    try:
        task = await Task.get(id=id)
        task.description = desc
        await task.save()
        return {"description": task.description}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="description not found")


# POST /api/task/change_responsible - изменить ответственного (передается id пользователя, ожидаю 200)
# ожидаю 200
@router.post("/api/task/change_responsible/{id}")
async def change_responsible(id: int, id_user: int):
    try:
        task = await Task.get(id=id)
        task.assignee_id = id_user
        await task.save()
        return {"msg": "assignee updated successully"}
    except DoesNotExist:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="User or Task not found")



# POST /api/task/move - поменять порядок (передаю id, столбец и индекс, в котором должна находиться таска, жду 200)
@router.put("/api/tasks/{task_id}/move")
async def move_task(task_id: int, new_column_id: int, new_index: int):
    async with in_transaction() as conn:
        # Получаем задачу, которую необходимо переместить
        task = await Task.get_or_none(id=task_id)
        if not task:
            raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")

        old_column_id = task.column_id
        old_index = task.index

        # Если перемещение происходит внутри той же колонки
        if old_column_id == new_column_id:
            if old_index < new_index:
                # Перемещение вниз: увеличиваем индексы между старым и новым положением
                tasks_to_shift = await Task.filter(column_id=new_column_id, index__gt=old_index, index__lte=new_index)
                for t in tasks_to_shift:
                    t.index -= 1
                    await t.save(using_db=conn)
            elif old_index > new_index:
                # Перемещение вверх: уменьшаем индексы между новым и старым положением
                tasks_to_shift = await Task.filter(column_id=new_column_id, index__gte=new_index, index__lt=old_index)
                for t in tasks_to_shift:
                    t.index += 1
                    await t.save(using_db=conn)

        else:
            # Перемещение в другую колонку
            tasks_to_shift_old = await Task.filter(column_id=old_column_id, index__gt=old_index)
            for t in tasks_to_shift_old:
                t.index -= 1
                await t.save(using_db=conn)

            tasks_to_shift_new = await Task.filter(column_id=new_column_id, index__gte=new_index)
            for t in tasks_to_shift_new:
                t.index += 1
                await t.save(using_db=conn)

            task.column_id = new_column_id

        # Обновляем индекс задачи
        task.index = new_index
        await task.save(using_db=conn)

    return {"success": True}


    

# POST /api/task/comments/ создать (передается text, user_id, task_id, возвращается id коммента)
@router.post("/api/comments")
async def create_comment(text: str, id_user: int, id_task: int):
    # проверка на существование задачи
    task = await Task.get_or_none(id=id_task)
    # проверка на текущего пользователя
    temp_user = await UserModel.get_or_none(id=id_user)
    if not task:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Task not found")
    
    if not temp_user:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="User not found")
    elif temp_user.role == "guest":
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="You haven't sufficient permission")
    

    comment = await Comments.create(
        author_id = id_user,
        text = text,
        task_id = id_task
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
            raise HTTPException(status_code=404, detail="Comments not found")

        # Возвращаем список комментариев
        return comments

    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Task not found")





# генерация эксель файла
@router.get("/export/board")
async def export_board_to_excel():
    # Получаем все колонки с задачами
    columns = await Column.all().prefetch_related('column')

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