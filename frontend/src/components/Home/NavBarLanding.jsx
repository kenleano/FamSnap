import React, { useState } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const NavBarLanding = () => {
  const { isLoggedIn } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility

  // Functions to handle mouse entering and leaving
  const showDropdown = () => setIsDropdownOpen(true);
  const hideDropdown = () => setIsDropdownOpen(false);

  return (
    <header className="sticky top-0 bg-white shadow-md flex items-center justify-between px-8 py-3.5 w-full z-10">
      {/* Logo and home link */}
      <div className="w-3/12">
        <Link to="/" className="flex items-center">
          <svg
            viewBox="0 0 248 31"
            className="h-6 w-auto hover:text-blue-700 duration-200"
          >
            {/* SVG path */}
          </svg>
          <span className="ml-2 text-xl font-bold text-gray-800 hover:text-blue-700">
            FamSnap
          </span>
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex-grow">
        <ul className="flex justify-end space-x-4">
          {isLoggedIn ? (
            <>
              <li>
                <CustomLink
                  to="/familytree"
                  className="text-gray-800 hover:text-blue-700"
                >
                  Family Tree
                </CustomLink>
              </li>
              <li>
                <CustomLink
                  to="/photos"
                  className="text-gray-800 hover:text-blue-700"
                >
                  Photos
                </CustomLink>
              </li>
              <li
                onMouseEnter={showDropdown}
                onMouseLeave={hideDropdown}
                className="relative"
              >
                <DropLink
                  className="text-gray-800 hover:text-blue-700"
                  id="dropdownHoverButton"
                  data-dropdown-toggle="dropdownHover"
                  data-dropdown-trigger="hover"
                >
                  Restoration
                </DropLink>
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
                    <ul className="py-1">
                      <li>
                        <Link
                          to="/restoration/enhance"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Enhance
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/restoration/colorize"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Colorize
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/restoration/professional-artist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Professional Artist
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
              <li>
                <CustomLink
                  to="/profile"
                  className="text-gray-800 hover:text-blue-700"
                >
                  Profile
                </CustomLink>
              </li>
            </>
          ) : (
            <>
              <CustomLink
                to="/login"
                className="text-gray-800 hover:text-blue-700"
              >
                Login
              </CustomLink>
              <CustomLink
                to="/register"
                className="text-gray-800 hover:text-blue-700"
              >
                Register
              </CustomLink>
            </>
          )}
        </ul>
      </nav>

      {/* Icons or additional buttons */}
      <div className="w-3/12 flex justify-end">{/* Icons or buttons */}</div>
    </header>
  );
};

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <Link
      to={to}
      {...props}
      className={`p-4 ${
        isActive
          ? "border-b-2 border-blue-700 text-blue-700"
          : "text-gray-800 hover:text-blue-700"
      }`}
    >
      {children}
    </Link>
  );
}
function DropLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <Link
      to={to}
      {...props}
      className={`p-4 ${
        isActive
          ? "text-gray-800 hover:text-blue-700"
          : "border-b-2 border-blue-700 text-blue-700"
      }`}
    >
      {children}
    </Link>
  );
}

export default NavBarLanding;
