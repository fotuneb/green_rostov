import React from "react";
import { Link } from "react-router-dom";
import Logout from "../Logout";
import "./navbar.css";

function Navbar(props) {
  return (
    <nav className="navbar">
      <Link to="/">
        <button className="nav-button">Kaban</button>
      </Link>
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
          <span className="h-8 w-px mx-6 bg-gray-200" aria-hidden="true" />
          <Logout setToken={props.setToken} />
        </div>
      )
      }
    </nav >
  );
}

export default Navbar;
