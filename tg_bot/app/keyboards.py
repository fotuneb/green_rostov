from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardButton, InlineKeyboardMarkup, DateTime
from aiogram.utils.keyboard import InlineKeyboardBuilder
from collections import defaultdict


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


def generate_task_keyboard(tasks):
    keyboard = InlineKeyboardBuilder()
    for task in tasks:
        keyboard.button(
            text=task['title'],  # Название задачи
            callback_data=f"task_{task['id']}"  # Уникальный callback_data
        )
    return keyboard.as_markup()

def generate_column_task_keyboard(tasks):
    grouped_tasks = defaultdict(list)
    for task in tasks:
        column_name = task.get("column_name", "Без колонки")
        grouped_tasks[column_name].append(task)

    # Создаем список клавиатур
    column_keyboards = {}
    for column_name, tasks_in_column in grouped_tasks.items():
        keyboard = InlineKeyboardBuilder()
        for task in tasks_in_column:
            keyboard.button(
                text=task["title"],
                callback_data=f"task_{task['id']}"
            )
        column_keyboards[column_name] = keyboard.as_markup()

    return column_keyboards
