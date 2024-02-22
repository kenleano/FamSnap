import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthContext";

const TreeComponent = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const treeRef = useRef(null); // Ref for the div element where the tree will be rendered

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:3000/users/${user.id}/familymembers`
        );
        if (!response.ok) {
          throw new Error("Could not fetch family members");
        }
        const data = await response.json();
        setFamilyMembers(data);
      } catch (error) {
        console.error("Failed to load family members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.id) {
      fetchFamilyMembers();
    }
  }, [user]);

  useEffect(() => {
    // Ensure the FamilyTree library is loaded
    if (window.FamilyTree) {
      // Initialize the family tree
      const nodes = familyMembers.map((member) => {
        const node = {
          id: member._id, // Use _id as the node id
          name: `${member.firstName} ${member.lastName}`, // Combine first and last name as the node name
          gender: member.gender, // Include gender if available
          pids: [member.pid], // Include parent IDs if available
          mid: member.mid,
          fid: member.fid,
          birthYear: member.birthday
            ? new Date(member.birthday).getFullYear()
            : "", // Extract birth year if available
        };

        return node;
      });

      new window.FamilyTree(treeRef.current, {
        nodeBinding: {
          field_0: "name",
          field_1: "gender",
          field_2: "birthYear",
        },
        nodes: nodes,
      });
      console.log(nodes);
    } else {
      console.error("FamilyTree library is not loaded.");
    }
  }, [familyMembers]); // Re-render the tree whenever familyMembers change

  return (
    <>
      <div>
        <h2>Family Members</h2>
        <ul>
          {familyMembers.map((member) => (
            <li key={member._id}>
              {member.firstName} {member.lastName} {member.mid}
            </li>
          ))}
        </ul>
      </div>
      <div ref={treeRef} style={{ width: "100%", height: "700px" }}></div>
    </>
  );
};

export default TreeComponent;
