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
      className="whitespace-nowrap text-base text-gray-500 hover:text-gray-900"
    >
      Выйти
    </button>
  );
}

export default Logout;
