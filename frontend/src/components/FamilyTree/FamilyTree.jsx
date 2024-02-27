import React from "react";
// import SideProfile from "./SideProfile";
import { useAuth } from "../AuthContext";
import Tree from "./Tree";
import SideProfile from "./SideProfile";
import AddFamilyMemberForm from "./AddFamilyMember";
// import TreeTrial from "./treesample";

const FamilyTree = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h2>{user.lastName} Family Tree</h2>
      <AddFamilyMemberForm />
      <Tree />
      {/* <SideProfile /> */}
    </div>
  );
};

export default FamilyTree;
