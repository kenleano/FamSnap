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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500">{error}</div>
        ) : (
          familyMembers.map((family) => (
            <div
              key={family.id}
              onClick={() => handleClick(family.name)}
              className="flex flex-col justify-between p-4 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out cursor-pointer"
            >
              <div className="overflow-hidden rounded-lg">
                <img
                  src={family.firstImageUrl || 'https://t3.ftcdn.net/jpg/01/18/01/98/360_F_118019822_6CKXP6rXmVhDOzbXZlLqEM2ya4HhYzSV.jpg'}
                  alt={`Cover of ${family.name}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="text-center mt-2 text-lg font-semibold">{family.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default People;
