import { useState, useEffect } from "react";
import supabase from "../helper/supabaseClient"; // Import Supabase client

const Sidebar = ({ user, onCalendarSelect, expanded }) => {
  const [calendars, setCalendars] = useState([]); // State to store sub-calendars
  const [activeCalendar, setActiveCalendar] = useState(""); // Track selected calendar

  useEffect(() => {
    const fetchCalendars = async () => {
      if (!user?.id) return;

      try {
        // Fetch all calendars
        const { data, error } = await supabase
          .from("calendars")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching calendars:", error);
          return;
        }

        // Filter calendars for users with privilege < 3
        let filteredCalendars = data;
        if (user.privilege < 3 && Array.isArray(user.service_assigned)) {
          filteredCalendars = data.filter((calendar) =>
            user.service_assigned.includes(calendar.name)
          );
        }

        // Change all "Mother Calendar" to "Master"
        const subCalendars = filteredCalendars.filter(
          (calendar) => calendar.name !== "Master"
        );
        setCalendars(subCalendars);
      } catch (error) {
        console.error("Unexpected error fetching calendars:", error);
      }
    };

    fetchCalendars(); // Call the function to fetch calendars when user changes
  }, [user]);

  const handleSelect = async (calendarName) => {
    setActiveCalendar(calendarName);

    try {
      let query = supabase.from("events").select("*");

      if (user.privilege >= 3) {
        if (calendarName !== "Master") {
          query = query.eq("Service_Type", calendarName);
        }
      } else if (user.privilege === 2) {
        const teamMemberNames = Array.isArray(user.teams) ? user.teams : [];
        const allNames = [user.username, ...teamMemberNames];

        query = query
          .eq("Service_Type", calendarName)
          .overlaps("Assign_Cleaner", allNames);
      } else {
        query = query
          .eq("Service_Type", calendarName)
          .contains("Assign_Cleaner", [user.username]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events for calendar:", error);
        return;
      }

      onCalendarSelect(data);
    } catch (error) {
      console.error("Unexpected error fetching events:", error);
    }
  };

  // Add expanded/collapsed class and tooltip/short attributes
  return (
    <div className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      {/* Master Calendar */}
      {user.privilege >= 3 && (
       <div
       className={`mother-calendar-box ${activeCalendar === "Master" ? "sidebar-active" : ""}`}
       data-tooltip="Master Calendar"
       data-short="M"
       onClick={() => handleSelect("Master")}
     >
       Master
     </div>
      )}

      {/* Divider (optional, add .divider CSS for styling) */}
      <div className="divider"></div>

      {/* Dynamically Render the Sub Calendars */}
      <div className="sub-calendars-container">
        {calendars.length === 0 ? (
          <div>No calendars available for your privilege level</div>
        ) : (
          calendars.map((calendar) => (
            <div
              key={calendar.id}
              className={`sub-calendar-box ${
                activeCalendar === calendar.name ? "sidebar-active" : ""
              }`}
              data-tooltip={calendar.name}
              data-short={calendar.name.charAt(0)}
              style={{
                backgroundColor:
                  activeCalendar === calendar.name
                    ? "#007bff"
                    : calendar.color || "#fff",
                color:
                  activeCalendar === calendar.name
                    ? "#fff"
                    : "#222",
              }}
              onClick={() => handleSelect(calendar.name)}
            >
              {calendar.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;