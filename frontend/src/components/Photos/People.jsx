import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const People = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!user || !user.id) {
        setLoading(false);
        setError("No user found");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3000/familytree/${user.id}`);
        setFamilyMembers(response.data);
      } catch (error) {
        console.error("Failed to load family members", error);
        setError("Failed to load family members");
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyMembers();
  }, [user]);

  const handleClick = (personName) => {
    navigate(`/photos/people/${encodeURIComponent(personName)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid justify-center content-center gap-5 grid-flow-col">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          familyMembers.map((family) => (
            <div
              key={family.id}
              onClick={() => handleClick(family.name)}
              className="flex flex-col justify-between p-4 bg-white rounded hover:shadow-lg transition duration-150 ease-in-out cursor-pointer"
            >
              <div className="overflow-hidden rounded">
                <img
                  src={family.firstImageUrl || 'https://t3.ftcdn.net/jpg/01/18/01/98/360_F_118019822_6CKXP6rXmVhDOzbXZlLqEM2ya4HhYzSV.jpg'}
                  alt={`Cover of ${family.name}`}
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              <div className="text-center mt-2">{family.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default People;
