import React, { useState } from "react";
import "./CreateEvent.css";
import { FaRedo } from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import { useCreateEventLogic } from "./CreateEventLogic";
import Select from 'react-select';

const CreateEvent = ({ setShowCreateEvent, setSelectedDate, addNewEvent, fetchEvents, user }) => {
  const {
    eventData, setEventData,
    file, setFile,
    uploading, setUploading,
    availableCleaners, setAvailableCleaners,
    selectedCleaners, setSelectedCleaners,
    teamMembers, setTeamMembers,
    warning, setWarning,
    conflictWarning, setConflictWarning,
    servicesList, setServicesList,
    repeatType, setRepeatType,
    repeatCount, setRepeatCount,
    isRepeating, setIsRepeating,
    customDates, setCustomDates,
    startDateRef, endDateRef, startTimeRef, endTimeRef,
    limitModal, setLimitModal,
    timeOptions,
    checkCleanerConflict,
    showAdvanced, setShowAdvanced,
    handleChange, toggleExtraService, formatDate, formatTime, handleSubmit
  } = useCreateEventLogic({ setShowCreateEvent, setSelectedDate, addNewEvent, fetchEvents, user });

  const [expandNotes, setExpandNotes] = useState(false);
  const getExtraServiceClass = (service, isSelected) => {
    if (!isSelected) return "extra-service-item";
    switch (service) {
      case "Tenancy":
      case "Renovation":
        return "extra-service-item selected blue";
      case "Disinfection":
        return "extra-service-item selected red";
      case "Formaldehyde":
        return "extra-service-item selected black";
      case "Aircon":
        return "extra-service-item selected green";
      case "Scrubbing":
        return "extra-service-item selected violet";
      default:
        return "extra-service-item selected";
    }
  };

  return (
    <div className="side-panel show">
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <input
          className="event-title-input"
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          required
          placeholder="Title"
        />
  
        {/* Extra Services (chips/buttons, only if not Float/Housekeeping/Curtain) */}
        {!(
          eventData.assignedService === "Float" ||
          eventData.assignedService === "Housekeeping" ||
          eventData.assignedService === "Curtain"
        ) && (
          <div className="extra-services-section" style={{ margin: "12px 0 8px 0" }}>
            {/* No chips/buttons UI here as requested */}
          </div>
        )}
  
{/* Start Date and Time */}
<div className="event-date">
  <span
    style={{ cursor: "pointer" }}
    onClick={() => { if (startDateRef.current) startDateRef.current.showPicker(); }}
  >
    {formatDate(eventData.startDate)}
  </span>
  <input
    type="date"
    name="startDate"
    value={eventData.startDate}
    onChange={handleChange}
    ref={startDateRef}
    required
    className="hidden-date-picker"
    placeholder="Start Date"
  />
  <select
  className="start-time-select"
  name="startTime"
  value={eventData.startTime}
  onChange={handleChange}
  ref={startTimeRef}
  required
>
  <option value="">Start Time</option>
  {timeOptions.map((t) => (
    <option key={t} value={t}>{formatTime(t)}</option>
  ))}
</select>
</div>

{/* End Date and Time */}
<div className="event-date">
  <span
    style={{ cursor: "pointer" }}
    onClick={() => { if (endDateRef.current) endDateRef.current.showPicker(); }}
  >
    {formatDate(eventData.endDate)}
  </span>
  <input
    type="date"
    name="endDate"
    value={eventData.endDate}
    onChange={handleChange}
    ref={endDateRef}
    required
    className="hidden-date-picker"
    placeholder="End Date"
  />
<select
  className="end-time-select"
  name="endTime"
  value={eventData.endTime}
  onChange={handleChange}
  ref={endTimeRef}
  required
>
  <option value="">End Time</option>
  {timeOptions.map((t) => (
    <option key={t} value={t}>{formatTime(t)}</option>
  ))}
</select>
</div>
  
        {/* Repeat Section */}
        <div className="repeat-section" style={{ marginBottom: 4 }}>
          <label className="repeat-toggle-label">
            <input
              type="checkbox"
              checked={isRepeating}
              onChange={() => {
                setIsRepeating((prev) => !prev);
                if (!isRepeating) setRepeatType("");
              }}
              style={{ marginRight: 8 }}
            />
            Repeating
          </label>
          {isRepeating && (
            <>
              <label className="repeat-label" style={{ marginLeft: 12 }}>
                <FaRedo style={{ marginRight: 6, color: "#1976d2" }} />
                Type:
              </label>
              <select
                className="repeat-select"
                value={repeatType}
                onChange={e => setRepeatType(e.target.value)}
                style={{ marginLeft: 8 }}
              >
                <option value="">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Custom">Custom</option>
              </select>
              {repeatType === "Custom" && (
                <div style={{ marginLeft: 8, marginTop: 8 }}>
                  <DatePicker
                    multiple
                    value={customDates}
                    onChange={setCustomDates}
                    format="YYYY-MM-DD"
                    placeholder="Select dates"
                    style={{ width: 200 }}
                  />
                  {Array.isArray(customDates) && customDates.length > 0 && (
                    <div className="custom-dates-list">
                      {customDates.map((date, idx) => (
                        <span key={idx} className="custom-date-chip">
                          {typeof date === "string" ? date : date.format("YYYY-MM-DD")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
  
        {/* Advanced Toggle Button */}
        <div style={{ margin: "4px 0 8px 0", display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className="extra-service-btn"
            style={{ width: 120 }}
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            {showAdvanced ? "Hide Advanced" : "Advance"}
          </button>
        </div>
  
        {/* Advanced Section */}
        {showAdvanced && (
          <div className="create-event-grouped-section">
            <div className="universal-section">
              <div
                className="universal-section-content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 0,
                  margin: 0,
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                {/* Service */}
                <div style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <span style={{
                    fontWeight: 500,
                    fontSize: 14,
                    marginRight: -40,
                    whiteSpace: "nowrap",
                    minWidth: 90
                  }}>
                    Service
                  </span>
                  <div style={{ flex: 1 }}>
                    <Select
                      classNamePrefix="react-select"
                      options={servicesList.map(s => ({ value: s.name, label: s.name }))}
                      value={
                        eventData.assignedService
                          ? { value: eventData.assignedService, label: eventData.assignedService }
                          : null
                      }
                      onChange={option =>
                        handleChange({
                          target: { name: "assignedService", value: option ? option.value : "" }
                        })
                      }
                      placeholder="Select service"
                      isClearable
                      styles={{
                        container: base => ({ ...base, width: "100%", minHeight: 32 }),
                        control: base => ({
                          ...base,
                          minHeight: 32,
                          height: 32,
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          background: "#fff"
                        }),
                        valueContainer: base => ({ ...base, minHeight: 32, height: 32 }),
                        input: base => ({ ...base, minHeight: 32 }),
                        indicatorsContainer: base => ({ ...base, height: 32 }),
                      }}
                    />
                  </div>
                </div>
  
                {/* Extra Services (Float, Housekeeping, or Curtain) */}
                {(eventData.assignedService === "Float" ||
                  eventData.assignedService === "Housekeeping" ||
                  eventData.assignedService === "Curtain") && (
                  <>
                    {warning && (
                      <div className="warning-message">
                        {warning}
                      </div>
                    )}
                    <label>Services:</label>
                    <div className="extra-services-container">
                      {eventData.assignedService === "Float" &&
                        [
                          "Tenancy",
                          "Renovation",
                          "Disinfection",
                          "Formaldehyde",
                          "Aircon",
                          "Scrubbing",
                          "Coating",
                          "Extra Ladder (>1200sqft)",
                        ].map((service) => {
                          const isSelected = eventData.extraService?.includes(service);
                          return (
                            <div
                              key={service}
                              className={getExtraServiceClass(service, isSelected)}
                            >
                              <input
                                type="checkbox"
                                id={`extra-service-${service}`}
                                checked={isSelected}
                                onChange={() => toggleExtraService(service)}
                              />
                              <label htmlFor={`extra-service-${service}`}>{service}</label>
                            </div>
                          );
                        })}
                      {eventData.assignedService === "Housekeeping" &&
                        [
                          "1x Session",
                          "4x Session",
                          "Aircon",
                          "Disinfection",
                          "Formaldehyde",
                          "Scrubbing",
                        ].map((service) => {
                          const isSelected = eventData.extraService?.includes(service);
                          return (
                            <div
                              key={service}
                              className={getExtraServiceClass(service, isSelected)}
                            >
                              <input
                                type="checkbox"
                                id={`extra-service-${service}`}
                                checked={isSelected}
                                onChange={() => toggleExtraService(service)}
                              />
                              <label htmlFor={`extra-service-${service}`}>{service}</label>
                            </div>
                          );
                        })}
                      {eventData.assignedService === "Curtain" &&
                        ["Collect", "Hangback"].map((service) => {
                          const isSelected = eventData.extraService?.includes(service);
                          return (
                            <div
                              key={service}
                              className={getExtraServiceClass(service, isSelected)}
                            >
                              <input
                                type="checkbox"
                                id={`extra-service-${service}`}
                                checked={isSelected}
                                onChange={() => toggleExtraService(service)}
                              />
                              <label htmlFor={`extra-service-${service}`}>{service}</label>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
  
                {/* Assign Cleaner (multi-select, styled like Service) */}
                <div style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <span style={{
                    fontWeight: 500,
                    fontSize: 14,
                    marginRight: -40,
                    whiteSpace: "nowrap",
                    minWidth: 90
                  }}>
                    Cleaner
                  </span>
                  <div style={{ flex: 1 }}>
                    <Select
                      classNamePrefix="react-select"
                      options={availableCleaners.map(c => ({
                        value: c.id,
                        label: c.username
                      }))}
                      value={selectedCleaners.map(c => ({
                        value: c.id,
                        label: c.username
                      }))}
                      onChange={options => {
                        setSelectedCleaners(
                          options ? options.map(opt =>
                            availableCleaners.find(c => c.id === opt.value)
                          ) : []
                        );
                      }}
                      isMulti
                      placeholder="Select cleaner(s)"
                      styles={{
                        container: base => ({ ...base, width: "100%", minHeight: 32 }),
                        control: base => ({
                          ...base,
                          minHeight: 32,
                          height: 32,
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          background: "#fff"
                        }),
                        valueContainer: base => ({ ...base, minHeight: 32, height: 32 }),
                        input: base => ({ ...base, minHeight: 32 }),
                        indicatorsContainer: base => ({ ...base, height: 32 }),
                        multiValue: base => ({ ...base, minHeight: 24 }),
                      }}
                    />
                  </div>
                </div>
  
                {/* Notes (after Cleaner) */}
                <div style={{ width: "100%", display: "flex", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{
                    fontWeight: 500,
                    fontSize: 14,
                    marginRight: -40,
                    whiteSpace: "nowrap",
                    minWidth: 90,
                    marginTop: 8
                  }}>
                    Notes
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: 32,
                        cursor: "pointer",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        padding: 0,
                        background: "#fff",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                      onClick={() => setExpandNotes((prev) => !prev)}
                    >
                      <span style={{ flex: 1, color: "#888", paddingLeft: 10 }}>
                        {eventData.notes ? "Edit notes" : "Add notes"}
                      </span>
                      <span style={{ fontSize: 14, paddingRight: 10 }}>{expandNotes ? "▲" : "▼"}</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        transition: "max-height 0.2s",
                        maxHeight: expandNotes ? 80 : 0,
                        overflow: "hidden"
                      }}
                    >
                      <textarea
                        name="notes"
                        value={eventData.notes}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          minHeight: 48,
                          marginTop: 4,
                          resize: "vertical",
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          padding: "6px 10px",
                          fontSize: 14,
                          boxSizing: "border-box"
                        }}
                        placeholder="Add notes"
                      />
                    </div>
                  </div>
                </div>
  
                {/* Receipt */}
                <div style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <span style={{
                    fontWeight: 500,
                    fontSize: 14,
                    marginRight: -40,
                    whiteSpace: "nowrap",
                    minWidth: 90
                  }}>
                    Receipt
                  </span>
                  <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    <label htmlFor="file-upload" style={{
                      cursor: "pointer",
                      flex: 1,
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 14,
                      padding: "0 10px",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      background: "#fff",
                      marginBottom: 0,
                      marginRight: 0
                    }}>
                      <span style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1
                      }}>
                        {file ? file.name : "No file chosen"}
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        style={{ display: "none" }}
                        onChange={e => setFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Submit and Cancel Buttons */}
        <div className="form-actions" style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Create Job"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              if (setShowCreateEvent) {
                setShowCreateEvent(false);
              } else if (setSelectedDate) {
                setSelectedDate(null);
              }
            }}
          >
            Cancel
          </button>
        </div>
      </form>
      {/* Limit Exceeded Modal */}
      {limitModal.open && (
        <div className="limit-modal-overlay" onClick={() => setLimitModal({ open: false, message: "" })}>
          <div className="limit-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 12, color: "#d32f2f" }}>Limit Exceeded</h2>
            <p style={{ marginBottom: 16 }}>{limitModal.message}</p>
            <button
              style={{
                padding: "8px 24px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={() => setLimitModal({ open: false, message: "" })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    {/* Warning Modal */}
    {conflictWarning && (
  <div className="limit-modal-overlay" onClick={() => setConflictWarning("")}>
    <div className="limit-modal" onClick={e => e.stopPropagation()}>
      <h2 style={{ marginBottom: 12, color: "#d32f2f" }}>Warning</h2>
      <p style={{ marginBottom: 16 }}>{conflictWarning}</p>
      <button
        style={{
          padding: "8px 24px",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
        onClick={() => setConflictWarning("")}
      >
        Close
      </button>
    </div>
  </div>
)}
  </div>
  );
};

export default CreateEvent;