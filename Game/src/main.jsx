
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css"; 
import GameMenu from "./components/GameMenu.jsx";
import TwoPlayerMode from "./components/TwoPlayerMode";
import ArcadeMode from "./components/ArcadeMode.jsx";
import ChooseCountry from "./components/ChooseCountry.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gamemenu" element={<GameMenu />} />
        <Route path="/2player" element={<TwoPlayerMode />} />
        <Route path="/arcade" element={<ArcadeMode />} />
        <Route path="/country" element={<ChooseCountry/>} />
      </Routes>
    </Router>
  </React.StrictMode>
);

