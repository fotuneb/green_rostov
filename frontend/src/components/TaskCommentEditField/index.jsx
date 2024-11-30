import React, { useState, useEffect } from 'react';

const TaskCommentEditField = ({ initialValue, setDescription }) => {
  // Состояние для текущего значения поля
  const [editedValue, setEditedValue] = useState(initialValue);
  
  // Состояние для хранения оригинального значения
  const [originalValue, setOriginalValue] = useState(initialValue);
  
  useEffect(() => {
    // При изменении initialValue, обновляем originalValue
    setOriginalValue(initialValue);
    setEditedValue(initialValue);
  }, [initialValue]);

  // Обработчик изменения текста в поле
  const handleChange = (event) => {
    setEditedValue(event.target.value);
  };

  // Обработчик выхода из поля (onBlur)
  const handleBlur = () => {
    if (editedValue !== originalValue) {
      console.log("Содержимое изменилось:", editedValue);
    } else {
      console.log("Содержимое не изменилось");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={editedValue}
        onChange={handleChange}
        onBlur={handleBlur}  // Срабатывает при выходе из поля
      />
    </div>
  );
};

export default TaskCommentEditField;
