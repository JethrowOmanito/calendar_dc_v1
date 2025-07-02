import React, { useState, useEffect } from "react";
import "./ToggleView.css";

const ToggleView = ({ view, setView }) => {
  const options = ["monthly", "weekly"];
  const [selectedIndex, setSelectedIndex] = useState(options.indexOf(view));

  useEffect(() => {
    setSelectedIndex(options.indexOf(view));
  }, [view]);

  const handleToggle = (index) => {
    setSelectedIndex(index);
    setView(options[index]); // Ensure parent state updates correctly
  };

  return (
    <div className="toggle-container">
      {/* Sliding highlight effect */}
      <div
        className="toggle-slider"
        style={{
          transform: `translateX(${selectedIndex * 100}%)`,
          transition: "transform 0.3s ease-in-out",
        }}
      ></div>

      {options.map((option, index) => (
        <button
          key={option}
          className={`toggle-button ${selectedIndex === index ? "active" : ""}`}
          onClick={() => handleToggle(index)}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ToggleView;
