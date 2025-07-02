import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import supabase from "../../helper/supabaseClient";
import { fetchCleanersByService } from "../../utils/fetchCleaners";

export function useCreateEventLogic({ setShowCreateEvent, setSelectedDate, addNewEvent, fetchEvents, user }) {
  const [eventData, setEventData] = useState({
    title: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    notes: "",
    assignedService: "",
    assignedCleaner: [],
    receiptUrl: "",
    extraService: "",
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [availableCleaners, setAvailableCleaners] = useState([]);
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [warning, setWarning] = useState("");
  const [servicesList, setServicesList] = useState([]);
  const [repeatType, setRepeatType] = useState("");
  const [repeatCount, setRepeatCount] = useState(1);
  const [isRepeating, setIsRepeating] = useState(false);
  const [customDates, setCustomDates] = useState([]);
  const [limitModal, setLimitModal] = useState({ open: false, message: "" });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conflictWarning, setConflictWarning] = useState("");

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const timeOptions = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, "0");
    const min = m === 0 ? "00" : "30";
    timeOptions.push(`${hour}:${min}`);
  }
}

  // Handle input changes
const handleChange = async (e) => {
  const { name, value } = e.target;

  // If startDate changes, set endDate to match
  if (name === "startDate") {
    setEventData((prev) => ({
      ...prev,
      startDate: value,
      endDate: value,
    }));
    return;
  }

  // If time changes (single dropdown), set startTime and endTime
  if (name === "startTime") {
    // Find index and get next hour for endTime
    const idx = timeOptions.indexOf(value);
    const endTime = timeOptions[idx + 1] || timeOptions[timeOptions.length - 1];
    setEventData((prev) => ({
      ...prev,
      startTime: value,
      endTime: endTime,
    }));
    return;
  }

  setEventData((prev) => ({ ...prev, [name]: value }));

  if (name === "assignedService") {
    if (!user) return;
    const cleaners = await fetchCleanersByService(value, user);
    setAvailableCleaners(cleaners);
  }
};
// ...existing code...

  const toggleExtraService = (service) => {
    setEventData((prev) => {
      const currentExtraServices = Array.isArray(prev.extraService) ? prev.extraService : [];
      if (currentExtraServices.includes(service)) {
        return {
          ...prev,
          extraService: currentExtraServices.filter((s) => s !== service),
        };
      } else {
        return {
          ...prev,
          extraService: [...currentExtraServices, service],
        };
      }
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "EEE, MMM d, yyyy");
  };

  const formatTime = (time) => {
    if (!time) return "Time";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const period = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHours}:${minutes} ${period}`;
  };

  const uploadFile = async (file) => {
    if (!file) return "";
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("doctor-clean-files")
      .upload(fileName, file);

    if (error) {
      console.error("File upload error:", error);
      throw error;
    }

    const { publicUrl } = supabase.storage
      .from("doctor-clean-files")
      .getPublicUrl(fileName);

    return fileName;
  };

  // --- CAPACITY CHECK FUNCTION ---
  const checkCapacityLimit = async ({ service, date, startTime, endTime, extraService }) => {
    // 1. Get the capacity for this date/service/start/end time
    const { data: capacityRow, error: capError } = await supabase
      .from("Capacity")
      .select("capacity")
      .eq("date_capaticty", date)
      .eq("service", service)
      .eq("Start_Time", startTime)
      .eq("End_Time", endTime)
      .maybeSingle();

    if (capError) {
      console.error("Capacity fetch error:", capError);
      return { allowed: true }; // fallback: allow
    }
    if (!capacityRow || !capacityRow.capacity) {
      return { allowed: true }; // no limit set, allow
    }
    const limit = capacityRow.capacity;

    // 2. Count events for this date/service/start/end time
    const { count, error: eventError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("Start_Date", date)
      .eq("Service_Type", service)
      .eq("Start_Time", startTime)
      .eq("End_Time", endTime)
      .contains("Extra_Service", Array.isArray(extraService) ? extraService : [extraService]);

    if (eventError) {
      console.error("Event count error:", eventError);
      return { allowed: true }; // fallback: allow
    }

    if (count >= limit) {
      return { allowed: false, limit, count };
    }
    return { allowed: true, limit, count };
  };
  // --- END CAPACITY CHECK FUNCTION ---

  const checkCleanerConflict = async ({ date, startTime, endTime, cleaners }) => {
    if (!cleaners.length) return false;
    const cleanerNames = cleaners.map(c => c.username);
    const { data: events, error } = await supabase
      .from("events")
      .select("Assign_Cleaner, Start_Time, End_Time, Start_Date")
      .eq("Start_Date", date);
  
    if (error) {
      console.error("Error checking cleaner conflicts:", error);
      return false;
    }
  
    const toMinutes = t => {
      if (!t) return 0;
      const [h, m] = t.split(":").map(Number);
      return h * 60 + (m || 0);
    };
    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);
  
    for (const event of events) {
      let assigned = event.Assign_Cleaner;
      if (!Array.isArray(assigned)) assigned = [assigned];
      // Debug
      console.log("Checking event:", event, "against cleaners:", cleanerNames);
      if (assigned.some(name => cleanerNames.includes(name))) {
        const eventStart = toMinutes(event.Start_Time);
        const eventEnd = toMinutes(event.End_Time);
        if (newStart < eventEnd && eventStart < newEnd) {
          console.log("Conflict found with event:", event);
          return true;
        }
      }
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarning("");
    setConflictWarning && setConflictWarning(""); // clear previous conflict warning if exists
  
    // Only require extraService for Float and Housekeeping
    if (
      (eventData.assignedService === "Float" || eventData.assignedService === "Housekeeping") &&
      (!Array.isArray(eventData.extraService) || eventData.extraService.length === 0)
    ) {
      setWarning("Please select at least one service.");
      return;
    }
  
    // --- CLEANER CONFLICT CHECK ---
    const assignedCleanerArray = selectedCleaners.length > 0 ? selectedCleaners : [];
    const conflict = await checkCleanerConflict({
      date: eventData.startDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      cleaners: assignedCleanerArray,
    });
    if (conflict) {
      if (typeof setConflictWarning === "function") {
        setConflictWarning("This cleaner is already assigned to another job at the same date and time.");
      } else {
        setWarning("One or more cleaners already have a job at this date and time.");
      }
      return;
    }
    // --- END CLEANER CONFLICT CHECK ---
  
    setUploading(true);
  
    try {
      let filePath = "";
      if (file) {
        filePath = await uploadFile(file);
      }
  
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const createdBy = loggedInUser?.username || "Unknown User";
  
      let repeatEvents = [];
  
      // Helper to always provide an array for Extra_Service
      const getExtraServiceArray = () => {
        if (
          eventData.assignedService === "Float" ||
          eventData.assignedService === "Housekeeping" ||
          eventData.assignedService === "Curtain"
        ) {
          return Array.isArray(eventData.extraService) ? eventData.extraService : [];
        }
        return [];
      };
  
      if (repeatType === "Custom" && Array.isArray(customDates) && customDates.length > 0) {
        customDates.forEach(dateObj => {
          const dateStr = typeof dateObj === "string" ? dateObj : dateObj.format("YYYY-MM-DD");
          repeatEvents.push({
            Title: eventData.title,
            Start_Date: dateStr,
            Start_Time: eventData.startTime,
            End_Date: dateStr,
            End_Time: eventData.endTime,
            Note: eventData.notes,
            Service_Type: eventData.assignedService,
            Extra_Service: getExtraServiceArray(),
            Assign_Cleaner: assignedCleanerArray.map((cleaner) => cleaner.username),
            Upload_files: filePath,
            created_By: createdBy,
          });
        });
      } else {
        let repeatTotal = 1;
        if (repeatType === "Daily" || repeatType === "Weekly" || repeatType === "Monthly") {
          repeatTotal = 7;
        }
        let startDate = new Date(eventData.startDate);
        let endDate = new Date(eventData.endDate);
  
        for (let i = 0; i < repeatTotal; i++) {
          let newStartDate = new Date(startDate);
          let newEndDate = new Date(endDate);
  
          if (repeatType === "Daily") {
            newStartDate.setDate(startDate.getDate() + i);
            newEndDate.setDate(endDate.getDate() + i);
          } else if (repeatType === "Weekly") {
            newStartDate.setDate(startDate.getDate() + i * 7);
            newEndDate.setDate(endDate.getDate() + i * 7);
          } else if (repeatType === "Monthly") {
            newStartDate.setMonth(startDate.getMonth() + i);
            newEndDate.setMonth(endDate.getMonth() + i);
          }
  
          repeatEvents.push({
            Title: eventData.title,
            Start_Date: newStartDate.toISOString().split("T")[0],
            Start_Time: eventData.startTime,
            End_Date: newEndDate.toISOString().split("T")[0],
            End_Time: eventData.endTime,
            Note: eventData.notes,
            Service_Type: eventData.assignedService,
            Extra_Service: getExtraServiceArray(),
            Assign_Cleaner: assignedCleanerArray.map((cleaner) => cleaner.username),
            Upload_files: filePath,
            created_By: createdBy,
          });
        }
      }
  
      // --- CAPACITY CHECK BEFORE INSERT ---
      for (const event of repeatEvents) {
        // If Extra_Service is an array, check each one
        const extraServices = Array.isArray(event.Extra_Service) ? event.Extra_Service : [event.Extra_Service];
        for (const extra of extraServices) {
          if (!extra) continue; // skip empty
          const check = await checkCapacityLimit({
            service: event.Service_Type,
            date: event.Start_Date,
            startTime: event.Start_Time,
            endTime: event.End_Time,
            extraService: extra, // check one at a time
          });
          if (!check.allowed) {
            setLimitModal({
              open: true,
              message: ` ${check.count} job(s) already scheduled for this slot for "${extra}" (limit: ${check.limit}).`
            });
            setUploading(false);
            return;
          }
        }
      }
      // --- END CAPACITY CHECK ---
  
      const { data, error } = await supabase
        .from("events")
        .insert(repeatEvents)
        .select("*");
  
      if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
      }
  
      if (data && Array.isArray(data)) {
        data.forEach((newEvent) => {
          let className = "";
          switch (eventData.assignedService) {
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
          newEvent.className = className;
        });
      }
  
      if (addNewEvent && data && Array.isArray(data)) {
        data.forEach((newEvent) => addNewEvent(newEvent));
      }
      if (fetchEvents) {
        await fetchEvents();
      }
  
      if (selectedCleaners.length > 0) {
        await sendNotifications(selectedCleaners, eventData.title);
      }
  
      if (setShowCreateEvent) {
        setShowCreateEvent(false);
      } else if (setSelectedDate) {
        setSelectedDate(null);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setUploading(false);
    }
  };

  const sendNotifications = async (cleaners, eventTitle) => {
    try {
      const notifications = cleaners.map((cleaner) => ({
        user_id: cleaner.id,
        message: `You have been assigned to the event: "${eventTitle}"`,
      }));

      const { error } = await supabase.from("notifications").insert(notifications);

      if (error) {
        console.error("Error sending notifications:", error);
      }
    } catch (err) {
      console.error("Error in sendNotifications:", err);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name");
      if (!error) setServicesList(data || []);
    };
    fetchServices();
  }, []);


  return {
    eventData, setEventData,
    file, setFile,
    uploading, setUploading,
    availableCleaners, setAvailableCleaners,
    selectedCleaners, setSelectedCleaners,
    teamMembers, setTeamMembers,
    warning, setWarning,
    conflictWarning, setConflictWarning, // <-- add these
    servicesList, setServicesList,
    repeatType, setRepeatType,
    repeatCount, setRepeatCount,
    isRepeating, setIsRepeating,
    customDates, setCustomDates,
    startDateRef, endDateRef, startTimeRef, endTimeRef,
    limitModal, setLimitModal,
    showAdvanced, setShowAdvanced,
    timeOptions,
    checkCleanerConflict,
    handleChange, toggleExtraService, formatDate, formatTime, handleSubmit
  };
}