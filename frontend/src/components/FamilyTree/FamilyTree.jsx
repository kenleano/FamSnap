import React from "react";
import SideProfile from "./SideProfile";
import { useAuth } from "../AuthContext";

const FamilyTree = () => {
  const { user } = useAuth();
  return (
    <div>
      <div className="flex justify-center w-screen">
        <h2>{user.lastName} Family Tree</h2>
      </div>
      <div>
        <SideProfile />
      </div>
    </div>
  );
};

export default FamilyTree;
