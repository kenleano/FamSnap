import React, { useEffect, useState } from 'react';

const FamilyTreeComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetching the family tree data from the server
    console.log("Fetching family tree data from the server...");
    fetch('http://localhost:3000/jsontree')
      .then(response => response.json())
      .then(data => {
        console.log("Received data:", data);
        setData(data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []); // This runs once on mount

  useEffect(() => {
    if (data.length > 0) {
      console.log("Initializing FamilyTree with data:", data);
      const family = new window.FamilyTree(document.getElementById("tree"), {
        nodeBinding: {
          field_0: "name",
        },
        nodeTreeMenu: true,
      });

      family.onUpdateNode((args) => {
        console.log("Updating node:", args);
        fetch('http://localhost:3000/jsontree', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(args)
        })
        .then(response => response.json())
        .then(updatedData => {
          console.log("Updated data received:", updatedData);
        })
        .catch(error => {
          console.error("Error updating node:", error);
        });
        // return false; to cancel the operation
      });

      family.load(data);
    }
  }, [data]); // This will re-run the effect when `data` changes

  console.log("Data TREE (state):", data);

  return (
    <div>
      <link rel="icon" href="/favicon.png" type="image/x-icon" />
      <div id="tree"></div>
    </div>
  );
};

export default FamilyTreeComponent;
