import React from "react";
import { useAuth } from "../AuthContext";
import MongoTree from "./MongoTree";
import Iframe from "react-iframe";

const FamilyTree = () => {
  const { user } = useAuth();
  const defaultImageUrl = "https://i.imgur.com/oPDS26Y.png";
  const defaultRestoredImageUrl = "https://i.imgur.com/fg9eb7w.jpg";

  const familyTreeUrl =
    "https://code.balkan.app/Result/family-tree-js/royal-family-tree";

  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <h2 className=" text-center text-2xl font-bold text-gray-800 py-5">
        {user.lastName} Family Tree
      </h2>
      <div className="h-3/4 w-full">
        <Iframe url={familyTreeUrl} height="100%" width="100%" />
      </div>
    </div>
    // <div className="flex flex-col items-center justify-center w-full h-full">

    //   <div className="w-full h-full">
    //   <h2 className=" text-center text-2xl font-bold text-gray-800 py-5">
    //     {user.lastName} Family Tree
    //   </h2>
    //     <MongoTree />
    //   </div>
    // </div>
  );
};

export default FamilyTree;
