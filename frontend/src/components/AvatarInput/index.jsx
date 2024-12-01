import React, { forwardRef } from "react";

const AvatarInput = forwardRef(({ fileName, setFileName, setFile }, ref) => {
  

  // Отслеживание смены аватарки
  const handleFileChanges = (event) => {
    const file = event.target.files[0];
    if (file) {
        setFile(file);
        setFileName(file.name); // Обновляем имя файла в состоянии
    } else {
        setFile(null);
        setFileName("Файл не выбран");
    }
  };

  return (
    <>
      <label htmlFor="avatar-input" className="user-profile-avatar-btn font-inter">
        Изменить аватар
        <span className="avatar-file-name-display">
          {fileName}
        </span>
      </label>
      <input
        type="file"
        id="avatar-input"
        className="user-profile-avatar-input"
        accept="image/*"
        onChange={handleFileChanges}
        ref={ref}
        style={{ display: "none" }} // Скрыть стандартный input (если нужно)
      />
    </>
  );
});

export default AvatarInput;