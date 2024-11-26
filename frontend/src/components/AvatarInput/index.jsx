import React, { useState, forwardRef } from "react";

const AvatarInput = forwardRef(({ fileName, setFileName }, ref) => {
  
  // Отслеживание смены аватарки
  const handleFileChanges = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : "Файл не выбран");
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
        style={{ display: "none" }} // Скрыть стандартный input (если нужно)
        ref={ref}
      />
    </>
  );
});

export default AvatarInput;