import React, { useState } from "react";
import { 
  FiMenu, FiSearch, FiSettings, FiPlusCircle, 
  FiUser, FiLogOut, FiChevronLeft, FiChevronRight,
  FiCheck, FiPrinter, FiCalendar
} from "react-icons/fi"; 
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "../Header/Header.css";
import logo from "../Logo/doctor_clean_logo.png"; 
import ToggleView from "../components/ToggleView";

const Header = ({ 
  view, 
  setView, 
  onLogout, 
  currentMonth, 
  sidebarExpanded,   // <-- ADD THIS
  setSidebarExpanded,// <-- ADD THIS
  goToPreviousMonth, 
  goToNextMonth,
  setShowCreateEvent, 
  user // Pass the user object to check privilege level
}) => {
  const [showDatePopup, setShowDatePopup] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="dashboard-header">
      {/* Left Section */}
      <div className="header-left">
      <div className="icon-box" onClick={() => setSidebarExpanded(prev => !prev)}>
          <FiMenu className="icon" />
        </div>
        <img src={logo} alt="Logo" className="header-logo" />
  
        <div className="date-container">
          <button
            className="today-button"
            onClick={() => setShowDatePopup(!showDatePopup)}
          >
            Today
          </button>
          {showDatePopup && (
            <div className="date-popup">
              {format(currentMonth, "dd MMMM yyyy")}
            </div>
          )}
  
          {view === "monthly" && (
            <>
              <div className="icon-box" onClick={goToPreviousMonth}>
                <FiChevronLeft className="icon" />
              </div>
              <div className="icon-box" onClick={goToNextMonth}>
                <FiChevronRight className="icon" />
              </div>
            </>
          )}
        </div>
  
        <div className="current-month-year">
          {view === "monthly" ? format(currentMonth, "MMMM yyyy") : "Current Week"}
        </div>
      </div>
  
      {/* Toggle View Section */}
      <div className="header-toggle">
        <ToggleView view={view} setView={setView} />
      </div>
  
      {/* Right Section */}
      <div className="header-icons">
        {/* Icons visible only for privilege 3 and above */}
        {user.privilege >= 3 && (
          <>
            <div
              className="icon-box"
              onClick={() => navigate("/check-cleaner-schedule")}
            >
              <FiUser className="icon" />
            </div>
            <div
              className="icon-box"
              onClick={() => {
                setShowCreateEvent((prev) => !prev);
              }}
            >
              <FiPlusCircle className="icon" />
            </div>
            <div className="icon-box" onClick={() => navigate("/convert-excel")}>
              <FiPrinter className="icon" />
            </div>
            <div
              className="icon-box"
              onClick={() => navigate("/check-availability")} // Navigate to CheckAvailability
            >
              <FiCheck className="icon" />
            </div>
          </>
        )}
  
        {/* Icons visible for all users */}
        <div className="icon-box" onClick={() => navigate("/search")}>
          <FiSearch className="icon" />
        </div>
        <div
          className="icon-box"
          onClick={() => {
            console.log("Settings icon clicked");
            navigate("/settings");
          }}
        >
          <FiSettings className="icon" />
        </div>
        <div className="icon-box" onClick={onLogout}>
          <FiLogOut className="icon" />
        </div>
      </div>
    </div>
  );
};

export default Header;