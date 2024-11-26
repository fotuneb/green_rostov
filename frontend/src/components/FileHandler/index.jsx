import React from "react";
import { useParams } from "react-router-dom";

const FileHandler = () => {
  const { filePath } = useParams();

  // Конструктор пути к изображению
  const fileUrl = `/backend/uploads/${filePath}`;

  return (
    <div>
      <img src={fileUrl} alt="Uploaded File" />
    </div>
  );
};

export default FileHandler;
