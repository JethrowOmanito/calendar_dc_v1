import React from "react";
import { format } from "date-fns";
import "./Dashboard_css/EventDetails.css";
import logo from "../Logo/upload-files.png";
import DropdownMenu from "../hooks/DropdownMenu";
import { useEventDetailsLogic } from "./EventDetailsLogic";
import Select from "react-select";
import supabase from "../helper/supabaseClient";

const EventDetails = ({ event, onClose, onEventUpdate, onDeleteEvent, currentUser }) => {
  const {
    fileUrls,
    isModalOpen,
    modalImage,
    comments,
    newComment,
    isEditing,
    editableEvent,
    serviceOptions,
    isDropdownOpen,
    isCopying,
    setIsCopying,
    copyEventData,
    setCopyEventData,
    calendarOptions,
    selectedCalendar,
    deleteEvent,
    setSelectedCalendar,
    setIsDropdownOpen,
    setIsEditing,
    setNewComment,
    setEditableEvent,
    handleInputChange,
    saveChanges,
    cancelEditing,
    formatTime,
    formatDateTimeRange,
    handlePrint,
    handleDropdownSelect,
    cleanerSuggestions,
    openModal,
    closeModal,
    handleFileChangeAndUpload,
    handleAddComment,
    showDeleteConfirm,
    setShowDeleteConfirm,
  } = useEventDetailsLogic(event, onEventUpdate, onDeleteEvent);

  if (!event) return null;

// Add this helper function above your return in the component
const getServiceColor = (service) => {
  switch ((service || "").toLowerCase()) {
    case "housekeeping":
      return "#ffeb3b";
    case "float":
      return "#2196f3";
    case "curtain":
      return "#4caf50";
    case "upholstery":
      return "#e91e63";
    default:
      return "#1976d2";
  }
};

const getAssignedCleanerNames = () => {
  if (!event.Assign_Cleaner || event.Assign_Cleaner.length === 0) return "No cleaner assigned";
  if (Array.isArray(event.Assign_Cleaner)) return event.Assign_Cleaner.join(", ");
  return event.Assign_Cleaner;
};



return (
  <div className="event-details-panel">
    {/* Header with Dropdown and Close */}
    <div className="event-details-header">
          <DropdownMenu
        options={["Edit", "Copy", "Delete"]}
        onOptionSelect={(option) => {
          if (option === "Delete") {
            setShowDeleteConfirm(true);
          } else {
            handleDropdownSelect(option);
          }
          setIsDropdownOpen(false);
        }}
      />
      <button className="event-details-panel-close-btn" onClick={onClose}>
        ✖
      </button>
    </div>

{/* Job Details */}
<h3>Job Details</h3>
<div className="event-details-panel-box">
  <p className="event-details-panel-service">
    <strong></strong>
    <span className="service-type-text">{event.Service_Type || "Not specified"}</span>
  </p>
  {/* Extra Services directly below the service type, before the title */}
  {Array.isArray(event.Extra_Service) && event.Extra_Service.length > 0 && (
    <div className="event-extra-services">
      <strong></strong> {event.Extra_Service.join(", ")}
    </div>
  )}
  <p
    className="event-details-panel-title"
    style={{ color: getServiceColor(event.Service_Type) }}
  >
    {event.Title}
  </p>
  <div className="event-details-panel-time">
    <div className="event-details-panel-date-row">
      <span>
        {format(new Date(event.Start_Date), "EEE, MMM d yyyy")}
      </span>
      <span className="event-details-panel-date-arrow">&nbsp;&gt;&nbsp;</span>
      <span>
        {format(new Date(event.End_Date), "EEE, MMM d yyyy")}
      </span>
    </div>
    <div className="event-details-panel-time-row">
      <span>
        {format(new Date(`1970-01-01T${event.Start_Time}`), "h:mmaaa")}
      </span>
      <span className="event-details-panel-date-arrow">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span>
        {format(new Date(`1970-01-01T${event.End_Time}`), "h:mmaaa")}
      </span>
    </div>
  </div>
</div>
    

    {/* Edit Modal */}
    {isEditing && (
      <div
        className="edit-modal-backdrop"
        onClick={(e) => {
          if (e.target.classList.contains("edit-modal-backdrop")) {
            cancelEditing();
          }
        }}
      >
        <div className="edit-modal">
          <h3>Edit Job</h3>
          <label>
            <strong></strong>
            <Select
              name="Service_Type"
              options={serviceOptions}
              value={
                serviceOptions.find(opt => opt.value === editableEvent.Service_Type) ||
                (editableEvent.Service_Type
                  ? { value: editableEvent.Service_Type, label: editableEvent.Service_Type }
                  : null)
              }
              onChange={selectedOption => {
                handleInputChange({
                  target: {
                    name: "Service_Type",
                    value: selectedOption ? selectedOption.value : "",
                  },
                });
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select service type..."
              isClearable
            />
          </label>
          <label>
            <strong></strong>
            <input
              type="text"
              name="Title"
              value={editableEvent.Title || ""}
              onChange={handleInputChange}
              style={{ width: "98%" }}
            />
          </label>
          <label>
            <strong>Assign Cleaner(s):</strong>
            <Select
              isMulti
              name="Assign_Cleaner"
              options={cleanerSuggestions.map(user => ({
                value: user.username,
                label: user.username
              }))}
              value={
                Array.isArray(editableEvent.Assign_Cleaner)
                  ? cleanerSuggestions
                      .filter(user => editableEvent.Assign_Cleaner.includes(user.username))
                      .map(user => ({
                        value: user.username,
                        label: user.username
                      }))
                  : []
              }
              onChange={selectedOptions => {
                handleInputChange({
                  target: {
                    name: "Assign_Cleaner",
                    value: selectedOptions.map(opt => opt.value).join(", "),
                  },
                });
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select cleaner(s)..."
              closeMenuOnSelect={true}
            />
          </label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label style={{ flex: 1 }}>
              <strong>Starts:</strong>
              <input
                type="date"
                name="Start_Date"
                value={editableEvent.Start_Date || ""}
                onChange={handleInputChange}
                style={{ marginRight: "0.5rem" }}
              />
              <input
                type="time"
                name="Start_Time"
                value={editableEvent.Start_Time || ""}
                onChange={handleInputChange}
              />
            </label>
            <label style={{ flex: 1 }}>
              <strong>Ends:</strong>
              <input
                type="date"
                name="End_Date"
                value={editableEvent.End_Date || ""}
                onChange={handleInputChange}
                style={{ marginRight: "0.5rem" }}
              />
              <input
                type="time"
                name="End_Time"
                value={editableEvent.End_Time || ""}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <label>
            <strong>Note:</strong>
            <textarea
              name="Note"
              value={editableEvent.Note || ""}
              onChange={handleInputChange}
              className="edit-modal-textarea"
            ></textarea>
          </label>
          <div className="edit-modal-actions">
            <button onClick={saveChanges}>Save</button>
            <button onClick={cancelEditing}>Cancel</button>
          </div>
        </div>
      </div>
    )}

{/* Copy Modal */}
{isCopying && (
  <div
    className="edit-modal-backdrop"
    onClick={e => {
      if (e.target.classList.contains("edit-modal-backdrop")) setIsCopying(false);
    }}
  >
    <div className="edit-modal">
      <h3>Copy Job</h3>
      <label>
        <strong>Target Calendar:</strong>
        <Select
          options={calendarOptions}
          value={selectedCalendar}
          onChange={setSelectedCalendar}
          placeholder="Select calendar..."
        />
      </label>
      <label>
        <strong>Service Type:</strong>
        <Select
          name="Service_Type"
          options={serviceOptions}
          value={
            serviceOptions.find(opt => opt.value === copyEventData?.Service_Type) ||
            (copyEventData?.Service_Type
              ? { value: copyEventData.Service_Type, label: copyEventData.Service_Type }
              : null)
          }
          onChange={selectedOption => {
  setCopyEventData({
    ...copyEventData,
    Service_Type: selectedOption ? selectedOption.value : "",
  });
}}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select service type..."
          isClearable
        />
      </label>
      <label>
        <strong>Title:</strong>
        <input
          type="text"
          name="Title"
          value={copyEventData?.Title || ""}
          onChange={e => setCopyEventData({ ...copyEventData, Title: e.target.value })}
          style={{ width: "98%" }}
        />
      </label>
      <label>
        <strong>Assign Cleaner(s):</strong>
        <Select
          isMulti
          name="Assign_Cleaner"
          options={cleanerSuggestions.map(user => ({
            value: user.username,
            label: user.username
          }))}
          value={
            Array.isArray(copyEventData?.Assign_Cleaner)
              ? cleanerSuggestions
                  .filter(user => copyEventData.Assign_Cleaner.includes(user.username))
                  .map(user => ({
                    value: user.username,
                    label: user.username
                  }))
              : []
          }
          onChange={selectedOptions => {
            setCopyEventData({
              ...copyEventData,
              Assign_Cleaner: selectedOptions.map(opt => opt.value),
            });
          }}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select cleaner(s)..."
          closeMenuOnSelect={true}
        />
      </label>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <label style={{ flex: 1 }}>
          <strong>Starts:</strong>
          <input
            type="date"
            name="Start_Date"
            value={copyEventData?.Start_Date || ""}
            onChange={e => setCopyEventData({ ...copyEventData, Start_Date: e.target.value })}
            style={{ marginRight: "0.5rem" }}
          />
          <input
            type="time"
            name="Start_Time"
            value={copyEventData?.Start_Time || ""}
            onChange={e => setCopyEventData({ ...copyEventData, Start_Time: e.target.value })}
          />
        </label>
        <label style={{ flex: 1 }}>
          <strong>Ends:</strong>
          <input
            type="date"
            name="End_Date"
            value={copyEventData?.End_Date || ""}
            onChange={e => setCopyEventData({ ...copyEventData, End_Date: e.target.value })}
            style={{ marginRight: "0.5rem" }}
          />
          <input
            type="time"
            name="End_Time"
            value={copyEventData?.End_Time || ""}
            onChange={e => setCopyEventData({ ...copyEventData, End_Time: e.target.value })}
          />
        </label>
      </div>
      <label>
        <strong>Note:</strong>
        <textarea
          name="Note"
          value={copyEventData?.Note || ""}
          onChange={e => setCopyEventData({ ...copyEventData, Note: e.target.value })}
          className="edit-modal-textarea"
        ></textarea>
      </label>
      <div className="edit-modal-actions">
        <button
          onClick={async () => {
            if (!selectedCalendar) return alert("Please select a calendar.");

            // Remove unwanted fields
            const {
              id,
              Ref_ID,
              created_at,
              updated_at,
              comments,
              calendar,
              ...eventToInsert
            } = copyEventData;

            // Assign_Cleaner should be an array (text[])
            if (
              eventToInsert.Assign_Cleaner &&
              !Array.isArray(eventToInsert.Assign_Cleaner)
            ) {
              eventToInsert.Assign_Cleaner = [eventToInsert.Assign_Cleaner];
            }

            // Set the calendar_id (not calendar)
            eventToInsert.calendar_id = selectedCalendar.value;

            // Set date_Created to now
            eventToInsert.date_Created = new Date().toISOString();

            // Remove undefined fields
            Object.keys(eventToInsert).forEach(
              key => eventToInsert[key] === undefined && delete eventToInsert[key]
            );

            // Only include columns that exist in your schema
            const allowedFields = [
              "Assign_Cleaner", "End_Date", "Note", "Service_Type", "Start_Date", "Title",
              "Upload_files", "Extra_Service", "Start_Time", "End_Time", "upload_files",
              "calendar_id", "date_Created", "created_By"
            ];
            const insertData = {};
            for (const key of allowedFields) {
              if (eventToInsert[key] !== undefined) insertData[key] = eventToInsert[key];
            }

            // Debug log
            console.log("Inserting event:", insertData);

            const { error } = await supabase.from("events").insert(insertData);

            if (!error) {
              setIsCopying(false);
              // Optionally refresh events or show a success message
            } else {
              alert("Failed to copy event.");
              console.error(error);
            }
          }}
        >
          Copy
        </button>
        <button onClick={() => setIsCopying(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

    {/* Combined Container: Note, Logs, Files, Add Comment */}
    <div className="event-details-panel-box">
      {/* Note Section */}
      <div className="notes-header">
        <h4 className="notes-title">Note</h4>
        <button className="print-confirmation-btn" onClick={handlePrint}>
          Print
        </button>
      </div>
      <p className="event-details-panel-notes">
        {event.Note || ""}
      </p>
      <hr />

      {/* Logs Section */}
      <div className="comments-display">
        <h4 className="logs-title">Logs</h4>
        <p className="event-created-info">
          {format(new Date(event.date_Created), "EEE, MMM d yyyy h:mmaaa")} by{" "}
          <strong>{event.created_By || "Unknown User"}</strong>
        </p>
        <p className="assigned-cleaners-info">
          <strong>Cleaners Assigned:</strong> {getAssignedCleanerNames()}
        </p>
      </div>
      <hr />

      {/* Files Section */}
      <div>
        <h4 className="uploaded-files-title">Files</h4>
        <div className="uploaded-files-container">
          {fileUrls.length > 0 ? (
            fileUrls.map((url, index) => {
              if (!url) return null;
              return (
                <div key={index} className="uploaded-file">
                  {url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                    <img
                      src={url}
                      alt=""
                      className="uploaded-image"
                      onClick={() => openModal(url)}
                    />
                  ) : url.match(/\.(pdf)$/i) ? (
                    <iframe
                      src={url}
                      title="Uploaded PDF"
                      className="uploaded-pdf"
                    ></iframe>
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="uploaded-link"
                    >
                      View File
                    </a>
                  )}
                </div>
              );
            })
          ) : (
            <p></p>
          )}
        </div>
      </div>
      <hr />

      {/* Comments & Add Comment Section */}
      <div>
        <h4 className="comments-title">Comments</h4>
        <div className="comments-container">
          {Array.isArray(comments) && comments.length > 0
            ? comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <div className="comment-header">
                    <strong className="comment-user">
                      {comment.user || "Anonymous"}
                    </strong>
                    <span className="comment-date">
                      {comment.date_Created
                        ? new Date(comment.date_Created).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                          })
                        : "Invalid Date"}
                    </span>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              ))
            : null}
        </div>
        <div className="file-comment-box">
          <div className="file-comment-container">
            {/* Upload File */}
            <div className="file-upload-container">
              <label htmlFor="upload-image" className="upload-label">
                <input
                  type="file"
                  id="upload-image"
                  accept="image/*,application/pdf"
                  className="upload-input"
                  multiple
                  onChange={handleFileChangeAndUpload}
                />
                <img
                  src={logo}
                  alt="Upload Files"
                  className="upload-icon"
                />
              </label>
            </div>
            {/* Add Comment */}
            <div className="add-comment">
              <textarea
                className="event-details-panel-textarea"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Image Modal */}
    {isModalOpen && (
      <div className="image-modal" onClick={closeModal}>
        <div className="image-modal-content">
          <img src={modalImage} alt="Full Size" />
        </div>
      </div>
    )}
{showDeleteConfirm && (
  <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
    <div
      className="modal-dialog"
      onClick={e => e.stopPropagation()}
      style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "350px",
        margin: "100px auto",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
      }}
    >
      <h3 className="delete-modal-title">Confirm Deletion</h3>
      <p className="delete-modal-message">Are you sure you want to permanently remove this event?</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: ".8rem", marginTop: "1.5rem" }}>
        <button
          className="delete-modal-cancel-btn"
          onClick={() => setShowDeleteConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="delete-modal-delete-btn"
          onClick={async () => {
            setShowDeleteConfirm(false);
            await deleteEvent(event.id);
          }}
        >
          Delete Event
        </button>
      </div>
    </div>
  </div>
)}
  </div>
);
};

export default EventDetails;