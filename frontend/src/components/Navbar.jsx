import React from "react";
import { Link } from "react-router-dom";
import Logout from "./Logout";

function Navbar(props) {
  return (
    <nav className="relative bg-white border-b-2 border-gray-100">
      <div className="container mx-auto flex justify-between py-3 px-2">
        <div className="flex items-center">
          <Link to="/">
            <h4 className="text-2xl font-bold text-indigo-600">Kaban</h4>
          </Link>
        </div>
        {!props.token ? (
          <div className="flex items-center">
            <Link
              to="/login"
              className="whitespace-nowrap text-base text-gray-500 hover:text-gray-900"
            >
              Вход
            </Link>
            <Link
              to="/signup"
              className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Регистрация
            </Link>
          </div>
        ) : (
          <div className="flex items-center py-3">
            <Link
              to="/board"
              className="whitespace-nowrap text-base text-gray-700 hover:text-gray-900"
            >
              Моя доска
            </Link>
            <span className="h-8 w-px mx-6 bg-gray-200" aria-hidden="true" />
            <Logout setToken={props.setToken} />
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
