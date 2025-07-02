import { useEffect, useState } from "react";
import { format } from "date-fns";
import supabase from "../helper/supabaseClient";
import generateConfirmationPDF from "../utils/generateConfirmationPDF";

export function useEventDetailsLogic(event, onEventUpdate, onDeleteEvent) {
  const [fileUrls, setFileUrls] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableEvent, setEditableEvent] = useState({ ...event });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cleanerSuggestions, setCleanerSuggestions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [isCopying, setIsCopying] = useState(false);
  const [copyEventData, setCopyEventData] = useState(null);
  const [calendarOptions, setCalendarOptions] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setEditableEvent({ ...event });
  }, [event]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("name");
      if (!error && data) {
        setServiceOptions(data.map(s => ({ value: s.name, label: s.name })));
      }
    };
    fetchServices();
  }, []);

  const fetchCalendars = async () => {
    const { data, error } = await supabase.from("calendars").select("id, name");
    if (!error && data) {
      setCalendarOptions(data.map(c => ({
        value: c.id,    // Use the UUID here!
        label: c.name
      })));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for Assign_Cleaner as array (comma-separated)
    if (name === "Assign_Cleaner") {
      const arr = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      setEditableEvent((prev) => ({ ...prev, [name]: arr }));
    } else {
      setEditableEvent((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const saveChanges = async () => {
    try {
      // Include Assign_Cleaner in the update
      const {
        Service_Type,
        Title,
        Start_Date,
        End_Date,
        Start_Time,
        End_Time,
        Note,
        Assign_Cleaner,
      } = editableEvent;
      const updatedEvent = {
        Service_Type,
        Title,
        Start_Date,
        End_Date,
        Start_Time,
        End_Time,
        Note,
        Assign_Cleaner,
      };
  
      const { data, error } = await supabase
        .from("events")
        .update(updatedEvent)
        .eq("id", event.id)
        .select()
        .single();
  
      if (error) {
        console.error("Error updating event:", error);
        alert("Failed to update the event. Please try again.");
        return;
      }
  
      setIsEditing(false);
      onEventUpdate(data);
    } catch (error) {
      console.error("Unexpected error during event editing:", error);
      alert("Unexpected error during event editing. Please try again.");
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditableEvent({ ...event });
  };

  const formatTime = (time) => {
    if (!time) return "Time not set";
    const [hours, minutes] = time.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
  };

  const formatDateTimeRange = (startDate, startTime, endDate, endTime) => {
    const start = `${format(new Date(startDate), "EEE, MMMM d yyyy")} ${formatTime(startTime)}`;
    const end = `${format(new Date(endDate), "EEE, MMMM d yyyy")} ${formatTime(endTime)}`;
    return `${start} > ${end}`;
  };

  const handlePrint = () => {
    const noteText = event.Note || "No notes provided";
    const title = event.Title || "event";
    const refId = event.Ref_ID || "";
    generateConfirmationPDF(noteText, title, refId);
  };

  const editEvent = async (event) => {
    try {
      const updatedTitle = prompt("Edit Title:", event.Title);
      const updatedNote = prompt("Edit Note:", event.Note);
      const updatedServiceType = prompt("Edit Service Type:", event.Service_Type);
      const updatedStartDate = prompt("Edit Start Date:", event.Start_Date);
      const updatedEndDate = prompt("Edit End Date:", event.End_Date);
      const updatedStartTime = prompt("Edit Start Time:", event.Start_Time);
      const updatedEndTime = prompt("Edit End Time:", event.End_Time);

      const { data, error } = await supabase
        .from("events")
        .update({
          Title: updatedTitle,
          Note: updatedNote,
          Service_Type: updatedServiceType,
          Start_Date: updatedStartDate,
          End_Date: updatedEndDate,
          Start_Time: updatedStartTime,
          End_Time: updatedEndTime,
        })
        .eq("id", event.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating event:", error);
        alert("Failed to update the event. Please try again.");
        return null;
      }

      return data;
    } catch (error) {
      console.error("Unexpected error during event editing:", error);
      alert("Unexpected error during event editing. Please try again.");
      return null;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      // 1. Fetch the event data first
      const { data: eventData, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
  
      if (fetchError || !eventData) {
        console.error("Error fetching event for deletion:", fetchError);
        // Optionally show a toast or set an error state instead of alert
        return false;
      }
  
      // 2. Insert the event data into Deleted_Job (archive)
      const { error: insertError } = await supabase
        .from("Deleted_Job")
        .insert([
          {
            ...eventData,
            date_Created: new Date().toISOString(), // Optionally update deletion time
          },
        ]);
  
      if (insertError) {
        console.error("Error archiving event to Deleted_Job:", insertError);
        // Optionally show a toast or set an error state instead of alert
        return false;
      }
  
      // 3. Delete from original table
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
  
      if (deleteError) {
        console.error("Error deleting event:", deleteError);
        // Optionally show a toast or set an error state instead of alert
        return false;
      }
  
      if (onDeleteEvent) {
        onDeleteEvent(eventId);
      }
  
      return true;
    } catch (error) {
      console.error("Unexpected error during event deletion:", error);
      // Optionally show a toast or set an error state instead of alert
      return false;
    }
  };

  const handleDropdownSelect = async (option) => {
    switch (option) {
      case "Edit":
        setIsEditing(true);
        break;
      case "Copy":
        setCopyEventData({ ...event }); // clone current event data
        setIsCopying(true);
        await fetchCalendars(); // fetch calendar options for the popup
        break;
      case "Delete":
        setShowDeleteConfirm(true); // Show your custom modal instead of window.confirm
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchFileUrls = async () => {
      if (event && event.Upload_files) {
        const filePaths = event.Upload_files.split(",");
        const urls = filePaths.map((path) => {
          if (!path.trim()) return null;
          const { data, error } = supabase.storage
            .from("doctor-clean-files")
            .getPublicUrl(path.trim());
          if (error) {
            console.error(`Error fetching public URL for ${path}:`, error);
            return null;
          }
          return data.publicUrl;
        });
        setFileUrls(urls.filter(Boolean));
      } else {
        setFileUrls([]);
      }
    };
    fetchFileUrls();
  }, [event]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("comments")
        .eq("id", event.id)
        .single();

      if (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      } else {
        const validatedComments = (data?.comments || []).map((comment) => ({
          text: comment.text || "",
          date_Created: comment.date_Created ? new Date(comment.date_Created).toISOString() : null,
          user: comment.user || "Anonymous",
        }));
        setComments(validatedComments);
      }
    };
    fetchComments();
  }, [event.id]);

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalImage("");
    setIsModalOpen(false);
  };

  const handleFileChangeAndUpload = async (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    setUploading(true);

    try {
      const uploadedFilePaths = [];

      for (const file of files) {
        const fileName = `uploads/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("doctor-clean-files")
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading file:", error);
          alert("Error uploading file. Please try again.");
          return;
        }

        uploadedFilePaths.push(data.path);
      }

      const existingFilePaths = event.Upload_files ? event.Upload_files.split(",") : [];
      const updatedFilePaths = [...existingFilePaths, ...uploadedFilePaths];

      const { data: updatedEvent, error: updateError } = await supabase
        .from("events")
        .update({ Upload_files: updatedFilePaths.join(",") })
        .eq("id", event.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating event with file paths:", updateError);
        alert("Error updating event. Please try again.");
        return;
      }

      if (onEventUpdate) {
        onEventUpdate(updatedEvent);
      }

      const urls = updatedFilePaths.map((path) => {
        const { publicUrl, error } = supabase.storage
          .from("doctor-clean-files")
          .getPublicUrl(path);

        if (error) {
          console.error(`Error generating public URL for ${path}:`, error);
        }
        return publicUrl;
      });

      setFileUrls(urls.filter(Boolean));
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
      alert("Unexpected error during file upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const userName = loggedInUser?.username || "Anonymous";

    const updatedComments = [
      ...comments,
      {
        text: newComment,
        date_Created: new Date().toISOString(),
        user: userName,
      },
    ];

    const { error } = await supabase
      .from("events")
      .update({ comments: updatedComments })
      .eq("id", event.id);

    if (error) {
      console.error("Error adding comment:", error);
    } else {
      setComments(updatedComments);
      setNewComment("");
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".dropdown-menu")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const fetchCleaners = async () => {
      if (!editableEvent.Service_Type) {
        setCleanerSuggestions([]);
        return;
      }
      const { data, error } = await supabase
        .from("user")
        .select("username, service_assigned")
        .contains("service_assigned", [editableEvent.Service_Type])
      console.log("Fetched cleaners:", data, "Error:", error, "Service Type:", editableEvent.Service_Type);
      if (!error && data) {
        setCleanerSuggestions(data);
      } else {
        setCleanerSuggestions([]);
      }
    };
    if (isEditing) fetchCleaners();
  }, [editableEvent.Service_Type, isEditing]);

  useEffect(() => {
    const fetchCleaners = async () => {
      if (!copyEventData?.Service_Type) {
        setCleanerSuggestions([]);
        return;
      }
      const { data, error } = await supabase
        .from("user")
        .select("username, service_assigned")
        .contains("service_assigned", [copyEventData.Service_Type]);
      if (!error && data) {
        setCleanerSuggestions(data);
      } else {
        setCleanerSuggestions([]);
      }
    };
    if (isCopying) fetchCleaners();
  }, [copyEventData?.Service_Type, isCopying]);

  return {
    fileUrls,
    isModalOpen,
    modalImage,
    selectedFiles,
    uploading,
    comments,
    newComment,
    isEditing,
    editableEvent,
    cleanerSuggestions,
    isDropdownOpen,
    serviceOptions,
    isCopying,
    setIsCopying,
    copyEventData,
    setCopyEventData,
    calendarOptions,
    selectedCalendar,
    showDeleteConfirm,
    setShowDeleteConfirm,
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
    editEvent,
    deleteEvent,
    handleDropdownSelect,
    openModal,
    closeModal,
    handleFileChangeAndUpload,
    handleAddComment,
  };
}