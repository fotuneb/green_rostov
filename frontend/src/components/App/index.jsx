import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getCookie } from "../Cookies";
import Board from "../../pages/Board";
import Navbar from "../Navbar";
import Register from "../../pages/Register";
import Login from "../../pages/Login";
import Index from "../../pages/Index";
import Admin from "../../pages/Admin"

function getToken() {
  return getCookie("token");
}

function App() {
  const [token, setToken] = useState(() => getToken());

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar token={token} setToken={setToken} />
        <Routes>
          <Route exact path="/" element={<Index />} />
          <Route exact path="/board" element={<Board token={token} />} />
          <Route
            exact
            path="/signup"
            element={<Register setToken={setToken} />}
          />
          <Route exact path="/login" element={<Login setToken={setToken} />} />
          <Route exact path="/admin" element={<Admin token={token} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
