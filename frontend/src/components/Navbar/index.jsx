import { React, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logout from "../Logout";
import SmallLogo from "../SmallLogo/index.jsx";
import { UserProfileModal } from "../UserProfileModal"
import { getCookie, isCookieExists } from "../../utilities/cookies.js"
import "./navbar.css";

function Navbar({setIsLogged}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  // Проверяем, находится ли пользователь на странице /admin
  const isAdminPage = location.pathname === "/admin";

  // Открытие/закрытие модального окна
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Проверка, задан ли токен (авторизованность пользователя)
  const isLogged = isCookieExists('token')

  return (
    <>
      <UserProfileModal isOpen={isModalOpen} onClose={closeModal} />
      <nav className="navbar">
        <SmallLogo />
        {!isLogged ? (
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
            <Logout setIsLogged={setIsLogged} />
          </div>
        )
        }
      </nav >
    </>
  );
}

export default Navbar;
