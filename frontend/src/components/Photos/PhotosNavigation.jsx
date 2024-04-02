import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

const PhotosNav = () => {
  return (
    <nav className="bg-white shadow flex items-center justify-between px-4 py-3 rounded-lg">
      <NavItem to="/photos">
        <img
          src="https://uxwing.com/wp-content/themes/uxwing/download/video-photography-multimedia/photo-gallery-icon.png"
          alt="All Photos Icon"
          className="inline-block w-7 h-auto mr-2"
        />
        All Photos
      </NavItem>
      <NavItem to="/photos/people">
        <img
          src="https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-and-woman-user-icon.png"
          alt="People Icon"
          className="inline-block w-7 h-auto mr-2"
        />
        People
      </NavItem>
      <NavItem to="/photos/albums">
        <img
          src="https://uxwing.com/wp-content/themes/uxwing/download/education-school/read-book-icon.png"
          alt="Albums Icon"
          className="inline-block w-7 h-auto mr-2"
        />
        Albums
      </NavItem>
    </nav>
  );
};

const NavItem = ({ to, children }) => {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname });

  return (
    <Link
      to={to}
      className={`text-gray-800 hover:text-blue-700 hover:bg-blue-50 py-2 px-4 transition duration-300 ease-in-out rounded-lg ${
        isActive ? "bg-blue-100" : ""
      }`}
    >
      {children}
    </Link>
  );
};

export default PhotosNav;
