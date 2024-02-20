// App.jsx
import React from "react";
import NavBar from "./components/NavBar";

import { Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import FamilyTree from "./components/FamilyTree/FamilyTree";
import Photos from "./components/Photos";
import Restoration from "./components/Restoration";
import Profile from "./components/Profile";
import Login from "./components/Home/Login";
import Register from "./components/Home/Register";
import NavBarLanding from "./components/Home/NavBarLanding";

function App() {
  return (
    <div className="App">
      <NavBarLanding />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/familytree" element={<FamilyTree />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/restoration" element={<Restoration />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
