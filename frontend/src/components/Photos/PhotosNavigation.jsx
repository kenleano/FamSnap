import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

const PhotosNav = () => {
  return (
    <nav className="bg-green-500 shadow-md flex items-center justify-between px-5 py-3 rounded-full">
      <NavItem to="/photos">All Photos</NavItem>
      <NavItem to="/photos/people">People</NavItem>
      <NavItem to="/photos/albums">Albums</NavItem>
    </nav>
  );
};

const NavItem = ({ to, children }) => {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname });

  return (
    <Link
      to={to}
      className={`text-white hover:text-green-200 hover:bg-green-600 py-1 px-3 transition duration-300 ease-in-out rounded-full ${
        isActive ? "bg-green-700" : ""
      }`}
    >
      {children}
    </Link>
  );
};

export default PhotosNav;
