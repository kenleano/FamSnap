import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

const PhotosNav = () => {
  return (
    <nav className="top-0 bg-white items-start w-full px-8 py-2">
      <ul className="w-full">
        <CustomLink
          to="/photos"
          className="text-gray-800 hover:text-blue-700 py-2 px-4 transition duration-300 ease-in-out block mb-2 w-full text-left"
        >
          All Photos
        </CustomLink>
        <CustomLink
          to="/photos/people"
          className="text-gray-800 hover:text-blue-700 py-2 px-4 transition duration-300 ease-in-out block mb-2 w-full text-left"
        >
          People
        </CustomLink>
        <CustomLink
          to="/photos/albums"
          className="text-gray-800 hover:text-blue-700 py-2 px-4 transition duration-300 ease-in-out block mb-2 w-full text-left"
        >
          Albums
        </CustomLink>
      </ul>
    </nav>
  );
};

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  // Adjust active class styling as necessary
  const activeClass = "bg-blue-100"; // Soft background color for active link
  const baseClass =
    "text-gray-800 hover:text-blue-700 py-2 px-4 transition duration-300 ease-in-out block mb-2 w-full text-left";

  return (
    <li className={`${isActive ? activeClass : ""} rounded`}>
      <Link to={to} {...props} className={baseClass}>
        {children}
      </Link>
    </li>
  );
}

export default PhotosNav;
