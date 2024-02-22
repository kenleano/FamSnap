import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

const PhotosNav = () => {
  return (
    <div>
      <div>
        <CustomLink to="/photos" className="text-black">
          <button>All Photos</button>
        </CustomLink>
        <br />
        <CustomLink to="/photos/people" className="text-black">
          <button>People</button>
        </CustomLink>
        <br />
        <CustomLink to="/photos/albums" className="text-black">
          <button>Albums</button>
        </CustomLink>
        <br />
      </div>
    </div>
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
