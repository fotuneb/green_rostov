from itsdangerous import URLSafeTimedSerializer, BadSignature
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.utils.deep_linking import decode_payload
from aiogram.filters import CommandStart, CommandObject
from config import SECRET_KEY
import aiohttp
from datetime import datetime
from app.keyboards import main_kb, notifications
from app.auth import auth, reg

router = Router()

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

@router.message(CommandStart(deep_link=True))
async def start_with_args(message: Message, command: CommandObject):
    telegram_id = message.from_user.id
    args = command.args
    payload = decode_payload(args)
    
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
                    task_list = "\n".join([
                       f"📌 <i>{task['title']}</i>\n"
                       f"Дедлайн: {datetime.fromisoformat(task['deadline']).strftime('%d.%m.%Y в %H:%M') if task.get('deadline') else 'Не установлен'}"
                       for task in tasks])
                
                    await message.answer(f"🔖 <b>Ваши задачи:</b>\n\n{task_list}", parse_mode="HTML")
            else:
                await message.answer("Ошибка получения задач. Попробуйте позже.")

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
