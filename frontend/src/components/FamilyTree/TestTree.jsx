import React, { useEffect, useState } from 'react';
import { useAuth } from "../AuthContext";

const FamilyTreeComponent = () => {
  const [data, setData] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  const { user } = useAuth();

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

  useEffect(() => {
    // Fetching the family tree data from the server
    fetch(
        `http://localhost:3000/fulltree`
      )
      .then(response => response.json())
      .then(setData)
      .catch(console.error);
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (data.length > 0) {
      const family = new window.FamilyTree(document.getElementById("tree"), {
        nodeBinding: {
          field_0: "name"
        },
        nodeTreeMenu: true,
      });

      family.onUpdateNode((args) => {
        fetch('http://localhost:3000/fulltree', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(args)
        })
        .then(response => response.json())
        .then(console.log)
        .catch(console.error);
        //return false; to cancel the operation
      });

      family.load(nodes);
    }
  }, [nodes]); // This will re-run the effect when `data` changes

  return (
    <div>
      <link rel="icon" href="/favicon.png" type="image/x-icon" />
      <div id="tree"></div>
    </div>
  );
};

export default FamilyTreeComponent;
