import React, { useRef, useEffect } from "react";
// Assuming FamilyTree is a JavaScript library you've imported or included in your project
// import FamilyTree from 'path-to-family-tree-library';

const FamilyTreeComponent = () => {
  const treeRef = useRef(null); // Create a ref to target the DOM element

  useEffect(() => {
    // Ensure the DOM element is available
    if (treeRef.current) {
      // Initialize the FamilyTree with the DOM element and configuration
      new window.FamilyTree(treeRef.current, {
        mouseScrool: window.FamilyTree.action.none,
        enableSearch: false,
        nodeTreeMenu: true,
        nodeBinding: {
          field_0: "name",
        },
        nodes: [
          { id: 1, pids: [2], name: "Amber McKenzie", gender: "female" },
          { id: 2, pids: [1], name: "Ava Field", gender: "male" },
          { id: 3, mid: 1, fid: 2, name: "Peter Stevens", gender: "male" },
          { id: 4, mid: 1, fid: 2, name: "Savin Stevens", gender: "male" },
          { id: 5, mid: 1, fid: 2, name: "Emma Stevens", gender: "female" },
        ],
      });
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div ref={treeRef} id="tree" style={{ width: "100%", height: "100%" }}>
      {/* Family tree will be attached here */}
    </div>
  );
};

export default FamilyTreeComponent;
