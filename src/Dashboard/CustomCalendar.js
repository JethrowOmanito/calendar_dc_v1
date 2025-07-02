import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import CreateEvent from "../Dashboard/CreateEvent/CreateEvent";
import ViewEvents from "./ViewEvents";
import EventDetails from "./EventDetails"; // Import the EventDetails component
import "./Dashboard_css/CustomCalendar.css";
import { getEventColorClass, getEventGradient } from "../utils/eventColorUtils"; // Import utility function for event color class

const CustomCalendar = ({ currentMonth, events, fetchEvents, user, deleteEvent,  capacityLimits = [] }) => {
  const [days, setDays] = useState([]); // Days in the calendar grid
  const [selectedDate, setSelectedDate] = useState(null); // Selected date for the side panel
  const [viewEvents, setViewEvents] = useState(null); // State to store events for the "View Events" panel
  const [selectedEvent, setSelectedEvent] = useState(null); // State for the selected event
  const [panelType, setPanelType] = useState(null); // Tracks which panel is open: "create", "view", or "details"
  const teamMemberNames = Array.isArray(user.teams) ? user.teams.map(String).map(s => s.trim()) : [];
  const [hoveredWarning, setHoveredWarning] = useState(null);
  const [warningModal, setWarningModal] = useState({ open: false, service: "", slot: "", capacity: "" });
  
  // Helper function to format time
  const formatTime = (time) => {
    if (!time) return ""; // Handle empty time
    const [hours, minutes] = time.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    return `${formattedHours}:${minutes} ${period}`;
  };

  // Generate calendar days
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });

    let newDays = [];
    let date = startDate;

    while (newDays.length < 42) {
      newDays.push(date);
      date = addDays(date, 1);
    }

    setDays(newDays);
  }, [currentMonth]);

  useEffect(() => {
    console.log("CustomCalendar re-rendered with events:", events);
  }, [events]);

  // Group and sort events by date
  const getEventsForDate = (date) => {
    console.log("Filtering events for date:", date);

    const filteredEvents = events.filter((event) => {
      console.log("Processing event:", event);

      if (user.privilege >= 3) {
        console.log("Admin user detected. Showing all events.");
        return isSameDay(new Date(event.Start_Date), date);
      }else if (user.privilege === 2) {
        console.log("Team leader detected. Checking team members' events.");
        const assignCleanerList = Array.isArray(event.Assign_Cleaner)
          ? event.Assign_Cleaner.map(String).map(s => s.trim())
          : [];
        const username = String(user.username).trim();
        const teamMemberNames = Array.isArray(user.teams) ? user.teams.map(String).map(s => s.trim()) : [];
      
        // Add these debug logs:
        console.log("user.username:", username);
        console.log("user.teams:", teamMemberNames);
        console.log("Assign_Cleaner:", assignCleanerList);
        console.log("assignCleanerList.includes(username):", assignCleanerList.includes(username));
        console.log(
          "assignCleanerList.some(cleaner => teamMemberNames.includes(cleaner)):",
          assignCleanerList.some((cleaner) => teamMemberNames.includes(cleaner))
        );
      
        const isEventVisible =
          isSameDay(new Date(event.Start_Date), date) &&
          (
            assignCleanerList.includes(username) ||
            assignCleanerList.some((cleaner) => teamMemberNames.includes(cleaner))
          );
      
        console.log("Event visibility for team leader:", isEventVisible);
        return isEventVisible;
      } else {
        console.log("Regular user detected. Checking own events.");
        const assignCleanerList = Array.isArray(event.Assign_Cleaner)
          ? event.Assign_Cleaner
          : [];
        const isEventVisible =
          isSameDay(new Date(event.Start_Date), date) &&
          assignCleanerList.includes(user.username);

        console.log("Event visibility for regular user:", isEventVisible);
        return isEventVisible;
      }
    });

    console.log("Filtered events for date:", filteredEvents);
    return filteredEvents.map((event) => {
      let className = "";
      // Only update staff member color for team leader view
      if (user.privilege === 2) {
        const assignCleanerList = Array.isArray(event.Assign_Cleaner)
          ? event.Assign_Cleaner.map(String).map(s => s.trim())
          : [];
        const username = String(user.username).trim();
        const teamMemberNames = Array.isArray(user.teams) ? user.teams.map(String).map(s => s.trim()) : [];
    
        if (
          !assignCleanerList.includes(username) &&
          assignCleanerList.some((cleaner) => teamMemberNames.includes(cleaner))
        ) {
          className = "event-staff-lightgreen"; // Light green for staff member
        }
      }
      // Keep existing type-based coloring if not staff member for team leader
      if (!className) {
        switch (event.Service_Type) {
          case "Housekeeping":
            className = "event-housekeeping";
            break;
          case "Float":
            className = "event-float";
            break;
          case "Curtain":
            className = "event-curtain";
            break;
          case "Upholstery":
            className = "event-upholstery";
            break;
          default:
            className = "event-default";
        }
      }
      return { ...event, className }; // Add className to the event object
    });
  };

  // Callback to add a new event to the state
  const addNewEvent = (newEvent) => {
    if (newEvent) {
      console.log("New event added:", newEvent); // Debug log
      fetchEvents(); // Refetch events after adding a new one

      // Directly add the new event to the events prop (if possible)
      events.push(newEvent); // Temporary update for immediate display
      setPanelType(null); // Close the CreateEvent panel
    }
  };

  const getLimitForDate = (date) => {
    if (!capacityLimits) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    const found = capacityLimits.find(
      (cap) => format(new Date(cap.date_capaticty), "yyyy-MM-dd") === dateStr
    );
    return found ? found.capacity : null;
  };

  function formatTimeWindow(time) {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    const min = m;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${min} ${ampm}`;
  }


  return (
    <>
      <div className="calendar-wrapper">
        <div className="calendar-header">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
        </div>
  
        <div className="calendar-grid">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const maxVisibleEvents = 3;
            const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
            const hiddenEventCount = dayEvents.length - maxVisibleEvents;
  
            // Get ALL capacity limits for this day
            let dayCaps = capacityLimits.filter(
              (cap) => format(new Date(cap.date_capaticty), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
            );
  
            // Sort by Start_Time (AM before PM)
            dayCaps = dayCaps.slice().sort((a, b) => {
              if (!a.Start_Time) return 1;
              if (!b.Start_Time) return -1;
              return a.Start_Time.localeCompare(b.Start_Time);
            });
  
            // Combine all caps into one string for display, format time as h:mm AM/PM
            const combinedWarning = dayCaps.length > 0
              ? dayCaps.map(cap =>
                  `limit: ${cap.capacity} (${cap.service || "N/A"}  ${formatTimeWindow(cap.Start_Time)} - ${formatTimeWindow(cap.End_Time)})`
                ).join(", ")
              : null;
  
            return (
              <div
                key={index}
                className={`calendar-day 
                  ${isSameMonth(day, currentMonth) ? "current-month" : "other-month"} 
                  ${isToday(day) ? "today" : ""}`}
                onClick={() => {
                  setPanelType("create");
                  setSelectedDate(day);
                  setViewEvents(null);
                }}
              >
                <span>{format(day, "d")}</span>
  
                {/* Show ONE combined warning at the top before events */}
                {combinedWarning && (
                  <div
                    className="calendar-warning-event"
                    onClick={e => {
                      e.stopPropagation();
                      setWarningModal({
                        open: true,
                        service: dayCaps.map(cap => cap.service || "N/A").join(", "),
                        timeWindow: dayCaps.map(cap =>
                          (cap.Start_Time && cap.End_Time)
                            ? `${formatTimeWindow(cap.Start_Time)} - ${formatTimeWindow(cap.End_Time)}`
                            : "N/A"
                        ).join(", "),
                        capacity: dayCaps.map(cap => cap.capacity).join(", ")
                      });
                    }}
                    style={{ cursor: "pointer" }}
                    title="Click to view details"
                  >
                    <span style={{ marginRight: 6 }}>⚠️</span>
                    <span>{combinedWarning}</span>
                  </div>
                )}
  
               {/* Get events for the current day */}
{visibleEvents.map((event, idx) => {
  const extra = Array.isArray(event.Extra_Service) ? event.Extra_Service : [];
  const gradient = getEventGradient(event);

  // Show bullet for:
  // - Curtain with Collect or Hangback
  // - Upholstery
  // - Only one extra service
  const showBullet =
    (event.Service_Type &&
      event.Service_Type.trim().toLowerCase() === "curtain" &&
      (extra.includes("Collect") || extra.includes("Hangback"))) ||
    (event.Service_Type &&
      event.Service_Type.trim().toLowerCase() === "upholstery") ||
    extra.length === 1;

  return (
    <div
      key={event.id || idx}
      className={`event ${event.className || ""} calendar-event-bullet ${showBullet ? getEventColorClass(event) : ""}`}
      style={gradient ? { background: gradient, color: "#fff", borderRadius: "6px" } : {}}
      onClick={(e) => {
        e.stopPropagation();
        setPanelType("details");
        setSelectedEvent(event);
      }}
    >
      <span className="event-title">{event.Title}</span>
      <span className="event-time">{formatTimeWindow(event.Start_Time)}</span>
    </div>
  );
})}
  
                {/* Show "+X more" button if there are hidden events */}
                {dayEvents.length >= 3 && (
  <button
    className="more-events-btn"
    onClick={(e) => {
      e.stopPropagation();
      setPanelType("view");
      setSelectedDate(day);
      setViewEvents(dayEvents);
    }}
  >
    +{hiddenEventCount}
  </button>
)}
              </div>
            );
          })}
        </div>
      </div>
  
      {panelType === "create" && selectedDate && (
        <div className="side-panel show">
          <button
            className="close-btn"
            onClick={() => {
              setPanelType(null);
              setSelectedDate(null);
              setViewEvents(null);
            }}
          >
            ✖
          </button>
          <h3>{format(selectedDate, "d MMMM, yyyy")}</h3>
          <CreateEvent
            user={user}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            addNewEvent={addNewEvent}
            fetchEvents={fetchEvents}
          />
        </div>
      )}
  
      {panelType === "view" && viewEvents && (
        <div className="side-panel show">
          <button
            className="close-btn"
            onClick={() => {
              setPanelType(null);
              setSelectedDate(null);
              setViewEvents(null);
            }}
          >
            ✖
          </button>
          <ViewEvents
            events={viewEvents}
            selectedDate={selectedDate}
            onEventClick={(event) => {
              setPanelType("details");
              setSelectedEvent(event);
            }}
          />
        </div>
      )}
  
      {panelType === "details" && selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => {
            setPanelType(null);
            setSelectedEvent(null);
          }}
          onEventUpdate={(updatedEvent) => {
            setSelectedEvent(updatedEvent);
            fetchEvents();
          }}
          onDeleteEvent={(eventId) => {
            deleteEvent(eventId);
            setPanelType(null);
            setSelectedEvent(null);
          }}
        />
      )}
  
      {warningModal.open && (
        <div className="calendar-modal-overlay" onClick={() => setWarningModal({ ...warningModal, open: false })}>
          <div className="calendar-modal" onClick={e => e.stopPropagation()}>
            <h2>Limit Details</h2>
            <p><strong>Service:</strong> {warningModal.service}</p>
            <p>
              <strong>Time Window:</strong> {warningModal.timeWindow}
            </p>
            <p><strong>Capacity:</strong> {warningModal.capacity}</p>
            <button onClick={() => setWarningModal({ ...warningModal, open: false })}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomCalendar;