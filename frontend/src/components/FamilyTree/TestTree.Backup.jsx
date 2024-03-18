import React, { useEffect, useState } from 'react';

const FamilyTreeComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetching the family tree data from the server
    fetch('http://localhost:3000/fulltree')
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

      family.load(data);
    }
  }, [data]); // This will re-run the effect when `data` changes

  return (
    <div>
      <link rel="icon" href="/favicon.png" type="image/x-icon" />
      <div id="tree"></div>
    </div>
  );
};

export default FamilyTreeComponent;
