import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthContext";

const TreeComponent = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);

  const [selectedMemberForDeletion, setSelectedMemberForDeletion] =
    useState("");
  const treeRef = useRef(null); // Ref for the div element where the tree will be rendered

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
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
      }
    };

    if (user && user.id) {
      fetchFamilyMembers();
    }
  }, [user]);

  useEffect(() => {
    // Ensure the FamilyTree library is loaded

    if (treeRef.current) {
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
        mouseScrool: window.FamilyTree.action.none, // Disable mouse scroll actions
        enableSearch: false, // Disable the search functionality
        nodeTreeMenu: true, // Enable the tree menu for nodes
        nodeMouseClick: window.FamilyTree.action.edit,
        nodeMenu: {
          details: { text: "Details" },
          edit: { text: "Edit" },
          add: { text: "Add" },
          remove: { text: "Remove" },
        },
        nodeBinding: {
          field_0: "name",
          field_1: "gender",
          field_2: "birthYear",
        },
        nodes: nodes,
      });
      console.log(nodes);
      // HandleDelete

      window.FamilyTree(treeRef.current, {
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
  }, [familyMembers]);

  const handleNodeDeletion = async (nodeId) => {
    if (window.confirm("Are you sure you want to delete this family member?")) {
      try {
        // Call your API to delete the node from the database
        const response = await fetch(
          `http://localhost:3000/familymembers/${nodeId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete the family member");

        // If the backend deletion was successful, remove the node from the FamilyTree
        if (window.FamilyTree && treeRef.current) {
          const tree = new window.FamilyTree(treeRef.current, {});
          tree.removeNode(
            nodeId,
            () => {
              console.log("Node removed successfully from the visualization");
              // Optionally, refresh your family members list here
            },
            true
          ); // Assuming true for fireEvent to update the tree accordingly
        }
      } catch (error) {
        console.error("Error deleting family member:", error);
      }
    }
  };
  return (
    <>
      <div>
        <div className="relative w-full max-w- mx-auto my-4">
          <select
            value={selectedMemberForDeletion}
            onChange={(e) => setSelectedMemberForDeletion(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white shadow"
          >
            <option value="">Select a family member to delete</option>
            {familyMembers.map(
              (member) =>
                member._id !== user.id && ( // Check if the member's ID is not equal to the user's ID
                  <option key={member._id} value={member._id}>
                    {member.firstName} {member.lastName}
                  </option>
                )
            )}
          </select>

          <button
            onClick={() => handleNodeDeletion(selectedMemberForDeletion)}
            disabled={!selectedMemberForDeletion}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-red-300"
          >
            Delete Selected Member
          </button>
        </div>
      </div>
      <div ref={treeRef} style={{ width: "100%", height: "700px" }}></div>
    </>
  );
};

export default TreeComponent;
