// Define the fixed Float time slots
export const FLOAT_SLOTS = [
    { label: "9:00-9:30 AM", start: "09:00", end: "09:30" },
    { label: "2:00-3:00 PM", start: "14:00", end: "15:00" },
    { label: "4:00-5:00 PM", start: "16:00", end: "17:00" },
    { label: "6:00-8:00 PM", start: "18:00", end: "20:00" },
  ];
  
  // Helper to check if two time ranges overlap
  function isOverlap(slotStart, slotEnd, eventStart, eventEnd) {
    return eventStart < slotEnd && eventEnd > slotStart;
  }
  
  // Convert "HH:mm" to minutes since midnight
  function toMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }
  
  // Main logic: returns an object { [cleaner]: { [slotLabel]: "free"/"busy" } }
  export function getFloatScheduleStatus({
    cleaners,
    events,
    selectedDate,
    selectionType,
    selectedCleaners,
    showFree = true, // true: show free, false: show busy
  }) {
    // Get the list of cleaners to check
    const cleanerList =
      selectionType === "Individual"
        ? cleaners.filter((c) => selectedCleaners.includes(c.username))
        : cleaners;
  
    // For each cleaner, for each slot, check if they have an event
    const result = {};
    for (const cleaner of cleanerList) {
      result[cleaner.username] = {};
      for (const slot of FLOAT_SLOTS) {
        // Find if this cleaner has an event in this slot on the selected date
        const slotStart = toMinutes(slot.start);
        const slotEnd = toMinutes(slot.end);
  
        const hasEvent = events.some(
          (event) =>
            event.Start_Date === selectedDate &&
            event.Assign_Cleaner &&
            event.Assign_Cleaner.includes(cleaner.username) &&
            // Check time overlap
            isOverlap(
              slotStart,
              slotEnd,
              toMinutes(event.Start_Time),
              toMinutes(event.End_Time)
            )
        );
        result[cleaner.username][slot.label] = hasEvent ? "busy" : "free";
      }
    }
  
    // Optionally filter to only show free or only busy slots
    if (showFree !== undefined) {
      for (const cleaner in result) {
        for (const slot in result[cleaner]) {
          if (showFree && result[cleaner][slot] !== "free") {
            delete result[cleaner][slot];
          }
          if (!showFree && result[cleaner][slot] !== "busy") {
            delete result[cleaner][slot];
          }
        }
      }
    }
  
    return result;
  }