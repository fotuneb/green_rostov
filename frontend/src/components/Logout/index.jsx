import React from "react";
import { useNavigate } from "react-router";

function Logout(props) {
  const navigate = useNavigate();

  function logoutUser() {
    props.setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
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
