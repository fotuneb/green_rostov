from itsdangerous import URLSafeTimedSerializer, BadSignature
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from config import SECRET_KEY
import aiohttp
from app.keyboards import main_kb, notifications

router = Router()

@router.message(Command("start"))
async def start_command(message: Message):
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://server:8000/api/check_telegram_link/{telegram_id}"
        ) as response:
            if response.status == 200:
                user_data = await response.json()
                if user_data.get("telegram_id") == telegram_id:
                    await message.answer(f"Добро пожаловать обратно, {user_data['username']}👋🏻!", reply_markup=main_kb)
                    return

    args = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else None

    if not args:
        await message.answer("Добро пожаловать! Пожалуйста, авторизуйтесь через сайт, чтобы использовать бота.")
        return

    serializer = URLSafeTimedSerializer(SECRET_KEY)
    try:
        user_id = serializer.loads(args)
    except BadSignature:
        await message.answer("Некорректный токен. Попробуйте снова.")
        return

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://server:8000/api/link_telegram",
            json={"user_id": user_id, "telegram_id": telegram_id},
        ) as response:
            if response.status == 200:
                await message.answer("Вы успешно привязали Telegram к своему аккаунту!",reply_markup=main_kb)
            else:
                await message.answer("Ошибка привязки. Попробуйте позже.")

@router.message(F.text == '🔖 Мои задачи 🔖')
async def my_tasks(message: Message):
    telegram_id = message.from_user.id  

    async with aiohttp.ClientSession() as session:
        async with session.get(
            "http://server:8000/api/user_tasks",  
            params={"telegram_id": telegram_id}  
        ) as response:
            if response.status == 200:
                data = await response.json()
                tasks = data.get("tasks", [])

                if not tasks:
                    await message.answer("У вас нет активных задач.")
                else:
                    task_list = "\n".join(
                        [f"📌 {task['title']}" for task in tasks]
                    )
                    await message.answer(f"🔖 <b>Ваши задачи:</b>\n\n{task_list}", parse_mode="HTML")
            else:
                await message.answer("Ошибка получения задач. Попробуйте позже.")

@router.message(F.text == "⏰ Уведомления ⏰")
async def notifications_settings(message: Message):
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        async with session.get(f"http://server:8000/api/user/notifications/{telegram_id}") as response:
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
        async with session.get(f"http://server:8000/api/user/notifications/{telegram_id}") as response:
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
            f"http://server:8000/api/user/notifications/{telegram_id}",
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
