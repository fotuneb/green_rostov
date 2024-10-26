import React from "react";
import { useNavigate } from "react-router";

function Logout(props) {
  const navigate = useNavigate();

  function logoutUser() {
    props.setToken("");
    localStorage.removeItem("token");
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
