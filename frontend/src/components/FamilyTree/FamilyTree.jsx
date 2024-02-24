import React from "react";
// import SideProfile from "./SideProfile";
import { useAuth } from "../AuthContext";
import Tree from "./Tree";
// import TreeTrial from "./treesample";

const FamilyTree = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center w-screen py-10">
      <h2>{user.lastName} Family Tree</h2>

      <Tree />
    </div>
  );
};

export default FamilyTree;
