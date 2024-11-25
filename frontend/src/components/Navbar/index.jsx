import { React, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logout from "../Logout";
import { UserProfileModal } from "../UserProfileModal"
import { getCookie } from "../../utilities/cookies.js"
import "./navbar.css";

function Navbar(props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  // Проверяем, находится ли пользователь на странице /admin
  const isAdminPage = location.pathname === "/admin";

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const excelExport = () => {
    window.location.href = process.env.REACT_APP_PUBLIC_URL + '/export/board';
  }

  return (
    <>
      <UserProfileModal isOpen={isModalOpen} onClose={closeModal} />
      <nav className="navbar">
        {/* Кнопка "Экспорт в Excel" отображается только при логине в админ-аккаунт */}
        {
          getCookie('role') == 'admin' && 
          <button className="nav-button" onClick={excelExport}>Экспорт в Excel</button>
        }
        {!props.token ? (
          <div className="font-inter">
            <Link to="/login">
              <button className="nav-button">Вход</button>
            </Link>
            <Link to="/signup">
              <button className="nav-button">Регистрация</button>
            </Link>
          </div>
        ) : (
          <div className={`navbar-container justify-end`}>
            {/* Кнопка "Админка" отображается только при логине в админ-аккаунт и если НЕ маршрут /admin */}
            {
              !isAdminPage && getCookie('role') == 'admin' && <Link to="/admin">
                <button className="nav-button">Админка</button>
              </Link>
            }
            {/* Кнопка "Моя доска" отображается только при логине в админ-аккаунт и если маршрут /admin */}
            {
              isAdminPage && getCookie('role') == 'admin' && <Link to="/board">
                <button className="nav-button">Моя доска</button>
              </Link>
            }
            <button onClick={openModal} className="nav-button">Профиль</button>
            <span className="h-8 w-px mx-6 bg-gray-200" aria-hidden="true" />
            <Logout setToken={props.setToken}/>
          </div>
        )
        }
      </nav >
    </>
  );
}

export default Navbar;
