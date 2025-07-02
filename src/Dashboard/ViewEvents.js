import React from "react";
import { format } from "date-fns";
import "./Dashboard_css/ViewEvent.css";
import { getEventColorClass } from "../utils/eventColorUtils"; // <-- Import the color util

const ViewEvents = ({ events, selectedDate, onEventClick }) => {
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  if (!selectedDate) {
    return null;
  }

  return (
    <div className="view-events">
      <h3>{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</h3>
      <ul>
        {events.map((event, idx) => (
          <li
            key={idx}
            className={`event ${getEventColorClass(event)}`} // <-- Use color class here
            onClick={() => onEventClick(event)}
          >
            <div className="event-time">
              <span>{formatTime(event.Start_Time)}</span>
              <span>{formatTime(event.End_Time)}</span>
            </div>
            <span className={`event-divider ${getEventColorClass(event)}`}></span>
            <span className="event-title">{event.Title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewEvents;