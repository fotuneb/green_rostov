import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; // Убедитесь, что путь к Navbar корректный

const LayoutWithNavbar = ({ token, setToken }) => {
  return (
    <>
      <Navbar token={token} setToken={setToken} />
      <Outlet /> {/* Рендер дочерних маршрутов */}
    </>
  );
};

export default LayoutWithNavbar;