import React from "react";
import { deleteCookie } from "../../utilities/cookies.js";
import { useNavigate } from "react-router";

function Logout({setIsLogged}) {
  const navigate = useNavigate();

  function logoutUser() {
    deleteCookie("token");
    deleteCookie("user_id");
    deleteCookie("role");

    setIsLogged(false)

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
