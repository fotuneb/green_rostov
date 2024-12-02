import React, { forwardRef, useRef } from "react";

const AvatarInput = forwardRef(({ setImage }, ref) => {
  const sandboxRef = useRef(null); 

  // Обработчик сэндбокса для выбора аватарки
  const handleFileChanges = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
              // Создаём canvas для ресайза
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              // Устанавливаем размеры canvas
              canvas.width = 256;
              canvas.height = 256;
              // Отрисовываем и изменяем размер изображения
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              // Получаем сжатое изображение в формате Data URL
              const resizedImage = canvas.toDataURL("image/jpeg", 0.9); // 0.9 — качество сжатия
              // Отображем image
              setImage(resizedImage); // Устанавливаем в состояние
          };
          img.onerror = () => {
              console.error("Ошибка загрузки изображения");
          };
          img.src = reader.result;
          setImage(img.src);
      };
      reader.readAsDataURL(selectedFile);  // Чтение файла как Data URL
    } else {
      console.error("Не выбран правильный файл");
    }
  };

  return (
    <div>
      <label htmlFor="avatar-input" className="user-profile-avatar-btn font-inter">
        Изменить аватар
      </label>
      <input
        type="file"
        id="avatar-input"
        className="user-profile-avatar-input"
        accept="image/*"
        onChange={handleFileChanges}
        ref={(el) => {
          sandboxRef.current = el;
          if (ref) ref.current = el; 
        }}
        style={{ display: "none" }}
      />
    </div>
  );
});

export default AvatarInput;
