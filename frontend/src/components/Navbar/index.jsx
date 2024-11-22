import { React, useState } from "react";
import { Link } from "react-router-dom";
import Logout from "../Logout";
import { UserProfileModal } from "../UserProfileModal"
import "./navbar.css";

function Navbar(props) {

  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const excelExport = () => {
    open(process.env.REACT_APP_PUBLIC_URL + '/export/board')
  }

  return (
    <>
      <UserProfileModal isOpen={isModalOpen} onClose={closeModal} />
      <nav className="navbar">
          <button className="nav-button" onClick={excelExport}>Экпорт Excel</button>
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
          <div>
            <Link to="/board">
              <button className="nav-button">Моя доска</button>
            </Link>
            {
              localStorage.getItem('role') == 'admin' && <Link to="/admin">
                <button className="nav-button">Админка</button>
              </Link>
            }
            <button onClick={openModal} className="nav-button">Профиль</button>
            <span className="h-8 w-px mx-6 bg-gray-200" aria-hidden="true" />
            <Logout setToken={props.setToken} />
          </div>
        )
        }
      </nav >
    </>
  );
}

export default Navbar;
