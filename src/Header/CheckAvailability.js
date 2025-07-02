import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import "./CheckAvailability.css";

const CheckAvailability = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availableCleaners, setAvailableCleaners] = useState([]);
  const [notification, setNotification] = useState("");

  const navigate = useNavigate();

  // Utility function to convert 24-hour time to 12-hour format
  const formatTimeTo12Hour = (time) => {
    if (!time || typeof time !== "string") return "Invalid time";
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  // Fetch services from the services table
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from("services").select("name");
      if (error) {
        setNotification("Error fetching services.");
        console.error("Error fetching services:", error);
      } else {
        setServices(data.map((service) => service.name));
      }
    };
    fetchServices();
  }, []);

  // Handle form submission to check availability
  const handleCheckAvailability = async () => {
    setNotification(""); // Clear previous notification

    // Use today's date if not selected
    let dateToCheck = selectedDate;
    if (!dateToCheck) {
      const today = new Date();
      dateToCheck = today.toISOString().split("T")[0]; // yyyy-mm-dd
      setSelectedDate(dateToCheck); // Optionally update the UI
    }

    if (!selectedService) {
      setNotification("Please select a service.");
      return;
    }

    try {
      // Fetch users assigned to the selected service
      const { data: users, error: userError } = await supabase
        .from("user")
        .select("username, service_assigned")
        .contains("service_assigned", [selectedService]);

      if (userError) {
        setNotification("Error fetching users.");
        console.error("Error fetching users:", userError);
        return;
      }

      // Fetch events for the selected date and service
      const { data: events, error: eventError } = await supabase
        .from("events")
        .select("Assign_Cleaner, Start_Date, Start_Time, End_Time")
        .eq("Service_Type", selectedService)
        .eq("Start_Date", dateToCheck);

      if (eventError) {
        setNotification("Error fetching events.");
        console.error("Error fetching events:", eventError);
        return;
      }

      // Group events by cleaner
      const eventsByCleaner = {};
      events.forEach((event) => {
        if (!eventsByCleaner[event.Assign_Cleaner]) {
          eventsByCleaner[event.Assign_Cleaner] = [];
        }
        eventsByCleaner[event.Assign_Cleaner].push(event);
      });

      // Utility function to add or subtract hours from a time
      const adjustTime = (time, hours) => {
        const [hour, minute] = time.split(":").map(Number);
        const newHour = (hour + hours + 24) % 24;
        return `${newHour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
      };

      let availability = [];

      if (!startTime || !endTime) {
        // No time selected: show all cleaners and their bookings for the day
        availability = users.map((user) => {
          const cleanerEvents = eventsByCleaner[user.username] || [];
          if (cleanerEvents.length === 0) {
            return {
              username: user.username,
              availableAfter: "Available all day",
            };
          }
          // List all booking times for the day
          const bookings = cleanerEvents
            .map(ev => {
              if (ev.Start_Time && ev.End_Time) {
                return `${formatTimeTo12Hour(ev.Start_Time)} - ${formatTimeTo12Hour(ev.End_Time)}`;
              }
              return null;
            })
            .filter(Boolean)
            .join(", ");
          return {
            username: user.username,
            availableAfter: `Booked: ${bookings}`,
          };
        });
      } else {
        // Time selected: check for overlaps
        availability = users.map((user) => {
          const cleanerEvents = eventsByCleaner[user.username] || [];
          const selectedStart = startTime;
          const selectedEnd = endTime;

          if (cleanerEvents.length === 0) {
            return {
              username: user.username,
              availableAfter: "Available now",
            };
          }

          const isUnavailable = cleanerEvents.some((event) => {
            const eventStart = event.Start_Time;
            const eventEnd = adjustTime(event.End_Time, 1);
            const adjustedStart = adjustTime(selectedStart, -1);
            const adjustedEnd = adjustTime(selectedEnd, 1);

            return (
              (adjustedStart < eventEnd && adjustedEnd > eventStart) ||
              (adjustedStart === eventStart)
            );
          });

          if (isUnavailable) {
            const lastEvent = cleanerEvents[cleanerEvents.length - 1];
            const lastEventEnd = lastEvent.End_Time;
            const availableAfterTime = adjustTime(lastEventEnd, 1);

            return {
              username: user.username,
              availableAfter: `After ${formatTimeTo12Hour(availableAfterTime)}`,
            };
          }

          return {
            username: user.username,
            availableAfter: "Available now",
          };
        });
      }

      setAvailableCleaners(availability);
      if (availability.length === 0) {
        setNotification("No cleaners available for the selected criteria.");
      }
    } catch (error) {
      setNotification("Error checking availability.");
      console.error("Error checking availability:", error);
    }
  };

  return (
    <div className="check-availability-page">
      {/* Notification */}
      {notification && (
        <div className="custom-notification">{notification}</div>
      )}

      {/* Back Arrow with Tooltip */}
      <div className="back-arrow-container">
        <div className="back-arrow" onClick={() => navigate("/dashboard")}>
          ←
        </div>
        <span className="tooltip-text">Back to Dashboard</span>
      </div>

      {/* Page Title */}
      <h2>Check Cleaner Availability</h2>

      {/* Service Selection */}
      <div className="check-availability-form-group">
        <label htmlFor="service">Select Service:</label>
        <select
          id="service"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">-- Select a Service --</option>
          {services.map((service, index) => (
            <option key={index} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      <div className="check-availability-form-group">
        <label htmlFor="date">Select Date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Start Time Selection */}
      <div className="check-availability-form-group">
        <label htmlFor="start-time">Start Time:</label>
        <input
          type="time"
          id="start-time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      {/* End Time Selection */}
      <div className="check-availability-form-group">
        <label htmlFor="end-time">End Time:</label>
        <input
          type="time"
          id="end-time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {/* Check Availability Button */}
      <button className="check-btn" onClick={handleCheckAvailability}>
        Check Availability
      </button>

      {/* Available Cleaners */}
      <div className="available-cleaners">
        <h3>Available Cleaners</h3>
        {availableCleaners.length > 0 ? (
          <ul>
            {availableCleaners.map((cleaner, index) => (
              <li key={index}>
                {cleaner.username} (Available after: {cleaner.availableAfter})
              </li>
            ))}
          </ul>
        ) : (
          <p>No cleaners available for the selected criteria.</p>
        )}
      </div>
    </div>
  );
};

export default CheckAvailability;