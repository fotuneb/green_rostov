from itsdangerous import URLSafeTimedSerializer, BadSignature
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.utils.deep_linking import decode_payload
from aiogram.filters import CommandStart, CommandObject
import aiohttp
import html
import re
from datetime import datetime
from app.keyboards import main_kb, notifications, generate_task_keyboard,generate_column_task_keyboard
from app.auth import auth, reg

router = Router()


@router.message(CommandStart(deep_link=True))
async def start_with_args(message: Message, command: CommandObject):
    telegram_id = message.from_user.id
    args = command.args
    payload = decode_payload(args)

    print("args", args)
    print("payload", payload)
    
    username = await auth(telegram_id)
    if username:
        await message.answer(f"Добро пожаловать обратно, {username} 👋🏻!", reply_markup=main_kb)
        return
    
    if await reg(payload, telegram_id):
        await message.answer("Вы успешно привязали Telegram к своему аккаунту!",reply_markup=main_kb)
        return
    else:
        await message.answer("Ошибка привязки. Попробуйте позже.")
        return

@router.message(CommandStart())
async def start_without_args(message: Message):
    telegram_id = message.from_user.id
    username = await auth(telegram_id)
    if username:
        await message.answer(f"Добро пожаловать обратно, {username} 👋🏻!", reply_markup=main_kb)
        return
    else:
        await message.answer("Добро пожаловать! Войдите через сайт ")
        return

@router.message(F.text == '🔖 Мои задачи 🔖')
async def my_tasks(message: Message):
    telegram_id = message.from_user.id  

    async with aiohttp.ClientSession() as session:
        async with session.get(
            "http://server:8000/api/tasks_tg",  
            params={"telegram_id": telegram_id}  
        ) as response:
            if response.status == 200:
                data = await response.json()
                tasks = data.get("tasks", [])

                if not tasks:
                    await message.answer("У вас нет активных задач.")
                else:
                    # Генерация клавиатур по колонкам
                    column_keyboards = generate_column_task_keyboard(tasks)

                    # Отправляем задачи по колонкам
                    for column_name, keyboard in column_keyboards.items():
                        await message.answer(
                            f"📂 <b>{column_name}</b>",
                            parse_mode="HTML",
                            reply_markup=keyboard
                        )
            else:
                await message.answer("Ошибка получения задач. Попробуйте позже.")

@router.callback_query(F.data.startswith("task_"))
async def show_task_details(callback_query: CallbackQuery):
    task_id = int(callback_query.data.split("_")[1])  

    async with aiohttp.ClientSession() as session:
        async with session.get(f"http://server:8000/api/task_tg/{task_id}") as response:
            if response.status == 200:
                task = await response.json()

                # Форматируем сообщение с информацией о задаче
                task_details = (
                    f"🔖 <b>Информация о задаче:</b>\n\n"
                    f"📂 Колонка: <i>{task['column_name']}</i>\n"
                    f"📌 Название: <i>{task['title']}</i>\n"
                    f"📋 Описание: <i>{task['description'] if task.get('description') else 'Нет описания'}</i>\n"
                    f"⏰ Дедлайн: {datetime.fromisoformat(task['deadline']).strftime('%d.%m.%Y в %H:%M') if task.get('deadline') else 'Не установлен'}\n"
                    f"👤 Назначил: <i>{task['author']}</i>\n"

                )
                comments = task.get("comments", [])
                if comments:
                    task_details += "\n💬 <b>Комментарии:</b>\n"
                    for comment in comments:
                        author = comment.get("author")
                        date = datetime.fromisoformat(comment["create_date"]).strftime('%d.%m.%Y в %H:%M')
                        text = comment.get("text", "Нет текста")
                        task_details += f"👤 <i>{author}</i> ({date}):\n{text}\n\n"
                else:
                    task_details += "\n💬 <b>Комментарии:</b> Нет комментариев\n"
                            
                
                cleaned_text = re.sub(r"<.*?>", "", task_details)

                await callback_query.message.answer(cleaned_text, parse_mode="HTML")
            else:
                await callback_query.message.answer("Ошибка получения информации о задаче. Попробуйте позже.")

    # Подтверждаем нажатие на кнопку
    await callback_query.answer()

@router.message(F.text == "⏰ Уведомления ⏰")
async def notifications_settings(message: Message):
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        async with session.get(f"http://server:8000/api/user/notifications_get/{telegram_id}") as response:
            if response.status == 200:
                data = await response.json()
                current_state = data.get("notifications", True)
                status_text = "включены" if current_state else "выключены"
            else:
                await message.answer("❌ Ошибка при получении состояния уведомлений. Попробуйте позже.")
                return

    await message.answer(
        f"🔔 Ваши уведомления сейчас {status_text}. Что вы хотите сделать?",
        reply_markup=notifications
    )

@router.callback_query(F.data == "toggle_notifications")
async def toggle_notifications(callback: CallbackQuery):
    telegram_id = callback.from_user.id

    async with aiohttp.ClientSession() as session:
        async with session.get(f"http://server:8000/api/user/notifications_get/{telegram_id}") as response:
            if response.status == 200:
                data = await response.json()
                current_state = data.get("notifications", True)
            else:
                await callback.message.edit_text(
                    "❌ Ошибка при получении состояния уведомлений.",
                    reply_markup=None
                )
                await callback.answer()
                return

    new_state = not current_state

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"http://server:8000/api/user/notifications_update/{telegram_id}",
            json={"notifications": new_state}
        ) as response:
            if response.status != 200:
                await callback.message.edit_text(
                    "❌ Ошибка при изменении состояния уведомлений.",
                    reply_markup=notifications
                )
                await callback.answer()
                return

    action = "включили" if new_state else "выключили"
    await callback.message.edit_text(
        f"✅ Вы {action} уведомления.",
        reply_markup=notifications
    )

    await callback.answer()
