import React from "react";
// import SideProfile from "./SideProfile";
import { useAuth } from "../AuthContext";
import Tree from "./Tree";
// import TreeTrial from "./treesample";

const FamilyTree = () => {
  const { user } = useAuth();
  return (
    <div>
      <div className="flex justify-center w-screen outline outline-gray-300 py-10">
        <h2>{user.lastName} Family Tree</h2>
      </div>
      <div className="flex flex-col items-center">
        <Tree />
        <div className="flex flex-row w-full justify-center">
          <div className="w-1/4 outline-gray-300 outline h-screen">
            {/* <SideProfile /> */}
          </div>
          <div className=" h-screen w-screen"></div>
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
