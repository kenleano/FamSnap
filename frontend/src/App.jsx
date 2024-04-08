// App.jsx
import React from "react";
// import NavBar from "./components/NavBar";

import { Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import FamilyTree from "./components/FamilyTree/FamilyTree";
import Photos from "./components/Photos/Photos";
import Restoration from "./components/Restoration/Restoration";
import Profile from "./components/Profile";
import Login from "./components/Home/Login";
import Register from "./components/Home/Register";
import NavBarLanding from "./components/Home/NavBarLanding";
import ArtistRegistration from "./components/Artist/ArtistRegistration";  
import ArtistLogin from "./components/Artist/ArtistLogin";
import ArtistDashboard from "./components/Artist/ArtistDashboard";
import Requests from "./components/Artist/Requests";
import Contact from "./components/Restoration/Contact";
import StripeContainer from "./components/Restoration/StripeContainer";
import UserRequests from "./components/Home/UserRequests";


function App() {
  return (
    <div className="">
      <NavBarLanding />
      <div className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/familytree" element={<FamilyTree />} />
          <Route path="/photos/*" element={<Photos />} />
          <Route path="/restoration/*" element={<Restoration />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/artist-registration" element={<ArtistRegistration />} />
          <Route path="/artist-login" element={<ArtistLogin />} />
          <Route path="/artist-dashboard" element={<ArtistDashboard />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/userrequests" element={<UserRequests />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment" element={<StripeContainer />} />

          
        </Routes>
      </div>
    </div>
  );
}

export default App;
