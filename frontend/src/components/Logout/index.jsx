import React from "react";
import { deleteCookie } from "../Cookies";
import { useNavigate } from "react-router";

function Logout(props) {
  const navigate = useNavigate();

  function logoutUser() {
    props.setToken("");
    deleteCookie("token");
    deleteCookie("user_id");
    deleteCookie("role");
    navigate("/");
  }

  return (
    <button
      onClick={logoutUser}
      className="nav-button"
    >
      Выйти
    </button>
  );
}

export default Logout;
