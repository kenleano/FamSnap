import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

const PhotosNav = () => {
  return (
    <nav className="bg-blue-700">
      <ul className="flex flex-col items-start p-4">
        <li>
          <CustomLink
            to="/photos"
            className="text-white py-2 px-4 hover:bg-blue-800 rounded transition duration-300 ease-in-out block mb-2"
          >
            All Photos
          </CustomLink>
        </li>
        <li>
          <CustomLink
            to="/photos/people"
            className="text-white py-2 px-4 hover:bg-blue-800 rounded transition duration-300 ease-in-out block mb-2"
          >
            People
          </CustomLink>
        </li>
        <li>
          <CustomLink
            to="/photos/albums"
            className="text-white py-2 px-4 hover:bg-blue-800 rounded transition duration-300 ease-in-out block mb-2"
          >
            Albums
          </CustomLink>
        </li>
      </ul>
    </nav>
  );
};

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <Link to={to} className={isActive ? "active" : ""} {...props}>
      {children}
    </Link>
  );
}

export default PhotosNav;
