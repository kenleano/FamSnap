import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

const Tree = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/users/${user.id}/familymembers`);
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

  if (isLoading) {
    return <div>Loading family members...</div>;
  }

  if (!familyMembers.length) {
    return <div>No family members found.</div>;
  }

  return (
    <div>
      <p>{user.id}</p>
      <h2>Family Members</h2>
      <ul>
        {familyMembers.map((member) => (
          <li key={member._id}>
            {member.firstName} {member.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tree;
