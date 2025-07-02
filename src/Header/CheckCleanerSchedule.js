import React, { useState, useEffect } from "react";
import "./CheckCleanerSchedule.css";
import { useNavigate } from "react-router-dom";
import {
  fetchServices,
  fetchCleaners,
  fetchEvents,
  exportToExcel,
} from "./Setting/CheckCleanerLogic/CheckCleanerLogic";
import {
  getFloatScheduleStatus,
  FLOAT_SLOTS,
} from "./Setting/CheckCleanerLogic/FloatLogic";

const CheckCleanerSchedule = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  const [selectionType, setSelectionType] = useState("");
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cleaners, setCleaners] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isServiceConfirmed, setIsServiceConfirmed] = useState(false);
  const [showFree, setShowFree] = useState(true); // For Float free/busy toggle
  const navigate = useNavigate();

  // Handle service selection with checkboxes
  const toggleServiceSelection = (service, isChecked) => {
    setSelectedService((prevSelected) => {
      if (isChecked) {
        return [...prevSelected, service];
      } else {
        return prevSelected.filter((s) => s !== service);
      }
    });
  };

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.Start_Date + "T" + a.Start_Time);
    const dateB = new Date(b.Start_Date + "T" + b.Start_Time);
    return dateA - dateB;
  });

  // Fetch services from Supabase
  useEffect(() => {
    fetchServices(setServices, setError, setLoading);
  }, []);

  // Fetch cleaners based on the selected service
  useEffect(() => {
    if (!selectedService || selectedService.length === 0) return;
    fetchCleaners(selectedService, setCleaners, setError, setLoading);
  }, [selectedService]);

  // Fetch events based on the selected service and date range
  useEffect(() => {
    if (!selectedService || selectedService.length === 0 || !startDate || !endDate) return;
    fetchEvents(selectedService, startDate, endDate, setEvents, setError, setLoading);
  }, [selectedService, startDate, endDate]);

  // Handle service selection
  const handleServiceSelect = (service) => {
    if (!selectedService.includes(service)) {
      setSelectedService((prevSelected) => [...prevSelected, service]);
    }
  };

  const removeService = (service) => {
    setSelectedService((prevSelected) =>
      prevSelected.filter((s) => s !== service)
    );
  };

  // Handle cleaner selection
  const toggleCleanerSelection = (cleaner) => {
    setSelectedCleaners((prev) =>
      prev.includes(cleaner)
        ? prev.filter((c) => c !== cleaner)
        : [...prev, cleaner]
    );
  };

  // Format date to "Thur 20, May 2025"
  const formatDate = (dateString) => {
    const options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Convert time to 12-hour format
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // FLOAT SCHEDULE LOGIC
  const isFloatSelected = selectedService.includes("Float") && startDate && selectionType;
  const floatStatus = isFloatSelected
    ? getFloatScheduleStatus({
        cleaners,
        events,
        selectedDate: startDate,
        selectionType,
        selectedCleaners,
        showFree,
      })
    : null;

  if (loading) {
    return <div className="ccs-loading">Loading...</div>;
  }

  if (error) {
    return <div className="ccs-error">{error}</div>;
  }




  return (
    <div className="ccs-background">
      <div className="ccs-container">
        <div className="ccs-header-row">
        <div
          className="ccs-dashboard-circle"
          onClick={() => navigate("/dashboard")}
          title="Go to Dashboard"
          tabIndex={0}
          style={{ cursor: "pointer" }}
        >
          &#8592;
        </div>
        <h1 className="ccs-title">Cleaner Schedule</h1>
        </div>
  
        {/* Step 1: Select Services */}
        {!isServiceConfirmed && (
          <div className="ccs-step ccs-card">
            <h2 className="ccs-subtitle">
              <i className="fas fa-concierge-bell"></i> Select Services
            </h2>
            <div className="ccs-service-dropdown">
              <select
                className="ccs-service-select"
                onChange={(e) => handleServiceSelect(e.target.value)}
                value=""
              >
                <option value="" disabled>
                  Select a service
                </option>
                {services.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="ccs-selected-services">
              {selectedService.map((service, index) => (
                <div key={index} className="ccs-selected-service-item">
                  <span>{service}</span>
                  <button
                    className="ccs-remove-button"
                    onClick={() => removeService(service)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
            <div className="ccs-center">
              <button
                className="ccs-confirm-button"
                onClick={() => setIsServiceConfirmed(true)}
                disabled={selectedService.length === 0}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        )}
  
        {/* Step 2: Select Individual or Team */}
        {isServiceConfirmed && (
          <div className="ccs-step ccs-card">
            <h2 className="ccs-subtitle">
              <i className="fas fa-users"></i> Select Individual or Team
            </h2>
            <div className="ccs-selection-type">
              <button
                className={`ccs-selection-button ${
                  selectionType === "Individual" ? "ccs-selected" : ""
                }`}
                onClick={() => setSelectionType("Individual")}
              >
                <i className="fas fa-user"></i> Individual
              </button>
              <button
                className={`ccs-selection-button ${
                  selectionType === "Team" ? "ccs-selected" : ""
                }`}
                onClick={() => setSelectionType("Team")}
              >
                <i className="fas fa-users"></i> Team
              </button>
            </div>
          </div>
        )}
  
        {/* Step 3: Select Date */}
        {selectionType && (
          <div className="ccs-step ccs-card">
            <h2 className="ccs-subtitle ccs-subtitle-date">
              <i className="fas fa-calendar-alt"></i> Select Date
            </h2>
            <div className="ccs-date-picker">
              <label className="ccs-date-label ccs-date-label-text">
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ccs-date-input"
                />
              </label>
              <label className="ccs-date-label ccs-date-label-text">
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ccs-date-input"
                />
              </label>
            </div>
          </div>
        )}
  
        {/* Step 2.1: Select Cleaners if Individual is Selected */}
        {selectionType === "Individual" && (
          <div className="ccs-step ccs-card">
            <h2 className="ccs-subtitle ccs-subtitle-cleaners">
              <i className="fas fa-broom"></i> Select Cleaners
            </h2>
            <div className="ccs-cleaners-list">
              {cleaners.map((cleaner) => (
                <label key={cleaner.username} className="ccs-cleaner-item">
                  <input
                    type="checkbox"
                    value={cleaner.username}
                    onChange={() => toggleCleanerSelection(cleaner.username)}
                  />
                  {cleaner.username}
                </label>
              ))}
            </div>
          </div>
        )}
  
        {/* Step 4: Display Cleaners and Events */}
        {selectedService && startDate && endDate && (
          <div className="ccs-step">
            <h2 className="ccs-subtitle ccs-subtitle-schedule">Cleaner Schedule</h2>
            <p className="ccs-summary">
              Service: <strong>{selectedService.join(", ")}</strong> | Date Range:{" "}
              <strong>
                {formatDate(startDate)} - {formatDate(endDate)}
              </strong>
            </p>
  
            {/* Show Free/Busy Checkbox only if Float is selected */}
            {selectedService.includes("Float") && (
              <div style={{ margin: "12px 0" }}>
                <label className="ccs-show-free-label">
                  <input
                    type="checkbox"
                    checked={showFree}
                    onChange={() => setShowFree((prev) => !prev)}
                    style={{ marginRight: 8 }}
                  />
                  Show Free Schedule
                </label>
              </div>
            )}
  
            {/* Only display Assigned Cleaners if "Team" is selected */}
            {selectionType === "Team" && (
              <>
                <h3 className="ccs-section-title ccs-section-title-team-cleaners">Cleaners</h3>
                {cleaners.length === 0 ? (
                  <p>No cleaners assigned to this service.</p>
                ) : (
                  <ul className="ccs-cleaners-list">
                    {cleaners.map((cleaner) => (
                      <li key={cleaner.username}>
                        <div>{cleaner.username}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
  
            <h3 className="ccs-section-title">Scheduled Events</h3>
            {events.length === 0 ? (
              <p>No events scheduled for this service.</p>
            ) : (
              <table className="ccs-events-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Cleaner</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents
                    .filter((event) => {
                      if (selectionType === "Individual") {
                        return event.Assign_Cleaner?.some((cleaner) =>
                          selectedCleaners.includes(cleaner)
                        );
                      }
                      return true;
                    })
                    .map((event, index) => (
                      <tr key={index}>
                        <td>{event.Title}</td>
                        <td>
                          {selectionType === "Individual"
                            ? event.Assign_Cleaner?.filter((cleaner) =>
                                selectedCleaners.includes(cleaner)
                              ).join(", ") || "N/A"
                            : event.Assign_Cleaner?.join(", ") || "N/A"}
                        </td>
                        <td>{formatDate(event.Start_Date)}</td>
                        <td>{formatTime(event.Start_Time)}</td>
                        <td>{formatTime(event.End_Time)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
  
        {/* Placeholder if no date is selected */}
        {(!startDate || !endDate) && (
          <div className="ccs-placeholder">
            <p style={{
              textAlign: "center",
              color: "#888",
              fontSize: "1.1em",
              margin: "40px 0"
            }}>
              Please select a service to view the calendar and export options.
            </p>
          </div>
        )}
  
        {/* Calendar View and Export/Reset Buttons only if dates are selected */}
        {startDate && endDate && (
          <>
            <h3 className="ccs-section-title">Calendar View</h3>
            <div className="ccs-calendar">
              {(() => {
                const dateRange = [];
                let currentDate = new Date(startDate);
                const end = new Date(endDate);
  
                while (currentDate <= end) {
                  dateRange.push(new Date(currentDate));
                  currentDate.setDate(currentDate.getDate() + 1);
                }
  
                return dateRange.map((date) => {
                  const dateString = date.toISOString().split("T")[0];
  
                  // If Float is selected, show float free/busy for each cleaner
                  if (selectedService.includes("Float")) {
                    const floatStatusForDay = getFloatScheduleStatus({
                      cleaners,
                      events,
                      selectedDate: dateString,
                      selectionType,
                      selectedCleaners,
                      showFree,
                    });
  
                    return (
                      <div key={dateString} className="ccs-calendar-day">
                        <div className="ccs-calendar-date">{formatDate(dateString)}</div>
                        <div className="ccs-calendar-cleaners">
                          {Object.entries(floatStatusForDay).map(([cleaner, slots]) =>
                            Object.keys(slots).length === 0 ? null : (
                              <div key={cleaner}>
                                <strong>{cleaner}</strong>
                                {Object.entries(slots).map(([slot, status]) => (
                                  <div key={slot} className={`ccs-float-slot ccs-float-${status}`}>
                                    {slot} {status}
                                  </div>
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  }
  
                  // Default: show events as before
                  const eventsForDate = events.filter(
                    (event) => event.Start_Date === dateString
                  );
  
                  const cleanersForDate = eventsForDate
                    .flatMap((event) =>
                      selectionType === "Individual"
                        ? event.Assign_Cleaner?.filter((cleaner) =>
                            selectedCleaners.includes(cleaner)
                          ).map((cleaner) => ({
                            cleaner,
                            time: event.Start_Time,
                          }))
                        : event.Assign_Cleaner?.map((cleaner) => ({
                            cleaner,
                            time: event.Start_Time,
                          }))
                    )
                    .filter(
                      (entry, index, self) =>
                        entry.cleaner &&
                        self.findIndex(
                          (e) => e.cleaner === entry.cleaner && e.time === entry.time
                        ) === index
                    );
  
                  return (
                    <div key={dateString} className="ccs-calendar-day">
                      <div className="ccs-calendar-date">{formatDate(dateString)}</div>
                      <div className="ccs-calendar-cleaners">
                        {cleanersForDate.length > 0 ? (
                          cleanersForDate.map((entry, index) => (
                            <div key={index} className="ccs-calendar-event">
                              {entry.cleaner} - {formatTime(entry.time)}
                            </div>
                          ))
                        ) : (
                          <span>No events</span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="ccs-actions-row">
              <button
                className="ccs-reset-button"
                onClick={() => {
                  setSelectedService([]);
                  setSelectionType("");
                  setSelectedCleaners([]);
                  setStartDate("");
                  setEndDate("");
                  setCleaners([]);
                  setEvents([]);
                  setIsServiceConfirmed(false);
                }}
              >
                Reset Selection
              </button>
              <button
                className="ccs-export-button"
                onClick={() =>
                  exportToExcel(
                    events,
                    startDate,
                    endDate,
                    selectionType,
                    selectedCleaners,
                    formatDate,
                    formatTime
                  )
                }
              >
                Export to Excel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckCleanerSchedule;