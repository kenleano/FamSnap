import React, { useState } from "react";

const History = () => {
  // State to manage the visibility of the history content
  const [isVisible, setIsVisible] = useState(false);

  // Function to toggle the visibility state
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div>
      <button onClick={toggleVisibility}>
        {isVisible ? "Hide History" : "Show History"}
      </button>

      {/* Conditionally render the History content based on isVisible state */}
      {isVisible && <div>History Content Goes Here</div>}
    </div>
  );
};

export default History;
