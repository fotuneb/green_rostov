import React, { forwardRef, useRef, useState } from "react";

const AvatarInput = forwardRef(({ setImage }, ref) => {
  const sandboxRef = useRef(null); 

  // Обработчик сэндбокса для выбора аватарки
  const handleFileChanges = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);  // Устанавливаем результат в состояние
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
