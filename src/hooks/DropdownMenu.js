import React, { useState } from "react";
import "./DropdownMenu.css";

const optionIcons = {
  Edit: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M14.7 2.29a1 1 0 0 1 1.41 0l1.6 1.6a1 1 0 0 1 0 1.41l-9.34 9.34-2.83.71.71-2.83 9.34-9.34z" fill="#1976d2"/>
      <path d="M3 17h14v2H3v-2z" fill="#bdbdbd"/>
    </svg>
  ),
  Copy: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="7" y="7" width="9" height="9" rx="2" fill="#1976d2"/>
      <rect x="4" y="4" width="9" height="9" rx="2" fill="#bdbdbd"/>
    </svg>
  ),
  Delete: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="7" width="10" height="8" rx="2" fill="#e53935"/>
      <rect x="8" y="2" width="4" height="2" rx="1" fill="#bdbdbd"/>
      <rect x="3" y="4" width="14" height="2" rx="1" fill="#bdbdbd"/>
    </svg>
  ),
};

const DropdownMenu = ({ options, onOptionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    setIsOpen(false);
    onOptionSelect(option);
  };

  return (
    <div className="dropdown-menu">
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open menu"
      >
        <span className="dropdown-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </span>
      </button>
      {isOpen && (
        <ul className="dropdown-options">
          {options.map((option, index) => (
            <li
              key={index}
              className={`dropdown-option${option === "Delete" ? " dropdown-option-delete" : ""}`}
              onClick={() => handleOptionClick(option)}
            >
              <span className="dropdown-option-icon">
                {optionIcons[option] || null}
              </span>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;