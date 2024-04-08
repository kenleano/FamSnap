import React from "react";
import { useAuth } from "../AuthContext";
import MongoTree from "./MongoTree";

const FamilyTree = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
     
      <div className="w-full h-full">
      <h2 className=" text-center text-2xl font-bold text-gray-800 py-5">
        {user.lastName} Family Tree
      </h2>
        <MongoTree />
      </div>
    </div>
  );
};

export default FamilyTree;
