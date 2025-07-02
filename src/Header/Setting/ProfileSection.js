import React, { useEffect, useState } from "react";
import { FiUser, FiShield, FiTool, FiAward, FiBook, FiHome } from "react-icons/fi";
import supabase from "../../helper/supabaseClient";
import "./ProfileSection.css";

const ProfileSection = ({ user }) => {
  const [housesCleaned, setHousesCleaned] = useState(0);

  useEffect(() => {
    const fetchHousesCleaned = async () => {
      if (!user?.username) return;
      const { count, error } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .contains("Assign_Cleaner", [user.username]);
      if (!error) setHousesCleaned(count || 0);
    };
    fetchHousesCleaned();
  }, [user]);

  // Hide badges, courses, houses cleaned if privilege >= 3
  const showCleanerStats = user?.privilege < 3;

  return (
    <div className="profile-full">
      <h3 className="profile-title">👤 User Profile</h3>

      <div className="profile-info">
        {/* Username */}
        <div className="profile-row">
          <FiUser className="profile-icon" />
          <div>
            <div className="profile-label">Username</div>
            <div className="profile-value">{user?.username || "N/A"}</div>
          </div>
        </div>

        {/* Role */}
        <div className="profile-row">
          <FiShield className="profile-icon" />
          <div>
            <div className="profile-label">Role</div>
            <div className="profile-value">{user?.role || "N/A"}</div>
          </div>
        </div>

        {/* Assigned Service */}
        <div className="profile-row">
          <FiTool className="profile-icon" />
          <div>
            <div className="profile-label">Assigned Service</div>
            <div className="profile-value">
              {Array.isArray(user?.service_assigned) && user.service_assigned.length > 0
                ? user.service_assigned.join(", ")
                : user?.service_assigned || "N/A"}
            </div>
          </div>
        </div>

        {/* Badges */}
        {showCleanerStats && (
          <div className="profile-row">
            <FiAward className="profile-icon" />
            <div>
              <div className="profile-label">Badges</div>
              <div className="profile-value">🏅 Top Cleaner, 🏆 Best Attendance</div>
            </div>
          </div>
        )}

        {/* Courses Attended */}
        {showCleanerStats && (
          <div className="profile-row">
            <FiBook className="profile-icon" />
            <div>
              <div className="profile-label">Courses Attended</div>
              <div className="profile-value">Cleaning 101, Advanced Sanitization</div>
            </div>
          </div>
        )}

        {/* Houses Cleaned */}
        {showCleanerStats && (
          <div className="profile-row">
            <FiHome className="profile-icon" />
            <div>
              <div className="profile-label">Houses Cleaned</div>
              <div className="profile-value">{housesCleaned}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;