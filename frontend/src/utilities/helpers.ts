// Форматирование даты публикации коммента
function formatPublishDate(datePosted: string): string {
    // Создаем базовый объект даты
    const date = new Date(datePosted);

    // Форматируем дату в нужный вид
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Добавляем ведущий ноль
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Итоговая сформатированная дата
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}