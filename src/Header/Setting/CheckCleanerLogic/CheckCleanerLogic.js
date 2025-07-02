import supabase from "../../../helper/supabaseClient";
import * as XLSX from "xlsx";

// Fetch services from Supabase
export const fetchServices = async (setServices, setError, setLoading) => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("name");
    if (error) throw error;
    setServices(data || []);
  } catch (err) {
    console.error("Error fetching services:", err);
    setError("Failed to fetch services. Please try again later.");
  } finally {
    setLoading(false);
  }
};

// Fetch cleaners based on the selected service
export const fetchCleaners = async (selectedService, setCleaners, setError, setLoading) => {
  setLoading(true);
  try {
    const { data: cleanersData, error: cleanersError } = await supabase
      .from("user")
      .select("username, service_assigned")
      .or(selectedService.map(service => `service_assigned.cs.{${service}}`).join(","));
    if (cleanersError) throw cleanersError;
    setCleaners(cleanersData || []);
  } catch (err) {
    console.error("Error fetching cleaners:", err);
    setError("Failed to fetch cleaners. Please try again later.");
  } finally {
    setLoading(false);
  }
};

// Fetch events based on the selected service and date range
export const fetchEvents = async (selectedService, startDate, endDate, setEvents, setError, setLoading) => {
  setLoading(true);
  try {
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("Assign_Cleaner, Title, Start_Date, Start_Time, End_Time")
      .or(selectedService.map(service => `Service_Type.eq.${service}`).join(","))
      .gte("Start_Date", startDate)
      .lte("Start_Date", endDate);
    if (eventsError) throw eventsError;
    setEvents(eventsData || []);
  } catch (err) {
    console.error("Error fetching events:", err);
    setError("Failed to fetch events. Please try again later.");
  } finally {
    setLoading(false);
  }
};

// Export to Excel
export const exportToExcel = (events, startDate, endDate, selectionType, selectedCleaners, formatDate, formatTime) => {
  // Generate the date range
  const dateRange = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Prepare data for Excel
  const excelData = dateRange.map((date) => {
    const dateString = date.toISOString().split("T")[0];
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
    return {
      Date: formatDate(dateString),
      Events:
        cleanersForDate.length > 0
          ? cleanersForDate
              .map((entry) => `${entry.cleaner} - ${formatTime(entry.time)}`)
              .join("\n")
          : "No events",
    };
  });

  // Convert data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Enable text wrapping in Excel cells
  Object.keys(worksheet).forEach((key) => {
    if (key[0] !== "!") {
      worksheet[key].s = { alignment: { wrapText: true } };
    }
  });

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Calendar");

  // Export the workbook to an Excel file
  XLSX.writeFile(workbook, "CleanerSchedule.xlsx");
};