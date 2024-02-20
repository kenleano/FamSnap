// NavBar.jsx
import React from "react";
import { Link, useMatch, useResolvedPath} from "react-router-dom";

export default function NavBar() {
  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <ul className="flex justify-between">
          <div className="flex-shrink-0">
            <li>
              <CustomLink to="/" className="text-white">
                FamSnap
              </CustomLink>
            </li>
          </div>
          <div className="flex">
            <li className="mr-4">
              <CustomLink to="/familytree" className="text-white">
                Family Tree
              </CustomLink>
            </li>
            <li className="mr-4">
              <CustomLink to="/photos" className="text-white">
                Photos
              </CustomLink>
            </li>
            <li className="mr-4">
              <CustomLink to="/restoration" className="text-white">
                Restoration
              </CustomLink>
            </li>
            <li>
              <CustomLink to="/profile" className="text-white">
                Profile
              </CustomLink>
            </li>
          </div>
        </ul>
      </nav>
    </div>
  );
}

function CustomLink({ to, children, ...props }) {
 const resolvedPath = useResolvedPath(to);
const isActive = useMatch({path: resolvedPath.pathname, end: true});
  return (
    <Link to={to} className={isActive ? "active" : ""} {...props}>
      {children}
    </Link>
  );
}
