from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardButton, InlineKeyboardMarkup, DateTime
from aiogram.utils.keyboard import InlineKeyboardBuilder


main_kb = ReplyKeyboardMarkup(keyboard=[
    [KeyboardButton(text='🔖 Мои задачи 🔖')],
    [KeyboardButton(text='⏰ Уведомления ⏰')],
], resize_keyboard=True)


notifications = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(text="🔕 Выключить уведомления", callback_data="toggle_notifications"),
            InlineKeyboardButton(text="🔔 Включить уведомления", callback_data="toggle_notifications")
        ]
    ]
)


