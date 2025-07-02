import React, { useState, useEffect } from "react";
import "./SettingsPage.css";
import {
  FiUser,
  FiCalendar,
  FiTool,
  FiUserPlus,
  FiUsers,
  FiHome,
  FiLogOut,
  FiHash,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ProfileSection from "../Header/Setting/ProfileSection";
import CreateCalendarSection from "../Header/Setting/CreateCalendarSection";
import RegisterServiceSection from "../Header/Setting/RegisterServiceSection";
import RegisterCleanerSection from "../Header/Setting/RegisterCleanerSection";
import ViewCleanersSection from "../Header/Setting/ViewCleanersSection";
import FloatCapacitySection from "../Header/Setting/FloatCapacitySection";
import DeletedJobs from "../Header/Setting/DeletedJobs"; // Make sure this exists and is exported as default

const SettingsPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState("Profile");
  const [user, setLocalUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setLocalUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const renderSection = () => {
    switch (active) {
      case "Profile":
        return <ProfileSection user={user} />;
      case "Create Calendar":
        return user?.privilege >= 3 ? <CreateCalendarSection /> : <p>Access Denied</p>;
      case "Register Service":
        return user?.privilege >= 3 ? <RegisterServiceSection /> : <p>Access Denied</p>;
      case "Register Cleaner":
        return user?.privilege >= 3 ? <RegisterCleanerSection /> : <p>Access Denied</p>;
      case "View Cleaners":
        return user?.privilege >= 3 ? <ViewCleanersSection /> : <p>Access Denied</p>;
      case "Float Capacity":
        return user?.privilege >= 3 ? <FloatCapacitySection /> : <p>Access Denied</p>;
      case "Deleted Jobs":
        return user?.privilege >= 3 ? <DeletedJobs /> : <p>Access Denied</p>;
      default:
        return <p>Select an item on the left to get started.</p>;
    }
  };

  return (
    <div className="settings-container">
      <aside className="settings-sidebar">
        <button
          className={`settings-item ${active === "Profile" ? "setting-active" : ""}`}
          onClick={() => setActive("Profile")}
        >
          <FiUser className="settings-icon" />
          Profile
        </button>

        {user?.privilege >= 3 && (
          <button
            className={`settings-item ${active === "Create Calendar" ? "setting-active" : ""}`}
            onClick={() => setActive("Create Calendar")}
          >
            <FiCalendar className="settings-icon" />
            Create Calendar
          </button>
        )}

        {user?.privilege >= 3 && (
          <button
            className={`settings-item ${active === "Register Service" ? "setting-active" : ""}`}
            onClick={() => setActive("Register Service")}
          >
            <FiTool className="settings-icon" />
            Register Service
          </button>
        )}

        {user?.privilege >= 3 && (
          <button
            className={`settings-item ${active === "Register Cleaner" ? "setting-active" : ""}`}
            onClick={() => setActive("Register Cleaner")}
          >
            <FiUserPlus className="settings-icon" />
            Register Cleaner
          </button>
        )}

        {user?.privilege >= 3 && (
          <button
            className={`settings-item ${active === "View Cleaners" ? "setting-active" : ""}`}
            onClick={() => setActive("View Cleaners")}
          >
            <FiUsers className="settings-icon" />
            View Cleaners
          </button>
        )}

        {user?.privilege >= 3 && (
          <button
            className={`settings-item ${active === "Float Capacity" ? "setting-active" : ""}`}
            onClick={() => setActive("Float Capacity")}
          >
            <FiHash className="settings-icon" />
            Float Capacity
          </button>
        )}

        {user?.privilege >= 3 && (
          <button
            className={`settings-item ${active === "Deleted Jobs" ? "setting-active" : ""}`}
            onClick={() => setActive("Deleted Jobs")}
          >
            <FiTrash2 className="settings-icon" />
            Deleted Jobs
          </button>
        )}

        <button
          className={`settings-item ${active === "Home" ? "setting-active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <FiHome className="settings-icon" />
          Home
        </button>

        <button className="settings-item logout" onClick={handleLogout}>
          <FiLogOut className="settings-icon" />
          Log out
        </button>
      </aside>

      <div className="settings-main">
        <h2>Settings</h2>
        {renderSection()}
      </div>
    </div>
  );
};

export default SettingsPage;