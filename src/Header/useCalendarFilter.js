import { useState, useEffect } from "react";
import supabase from "../helper/supabaseClient";

const useCalendarFilter = ({
  selectedCalendar,
  searchQuery,
  selectedUser,
  startDate,
  endDate,
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      try {
        let query = supabase.from("events").select("*");

        // Filter by current month if no custom date range is set
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const defaultStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
        const defaultEnd = `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`;

        query = query
          .gte("Start_Date", startDate || defaultStart)
          .lte("Start_Date", endDate || defaultEnd);

        if (selectedCalendar && selectedCalendar !== "Mother Calendar") {
          query = query.eq("Service_Type", selectedCalendar);
        }

        if (selectedUser) {
          query = query.eq("Assigned_To", selectedUser);
        }

        if (searchQuery) {
          query = query.or(
            `Title.ilike.%${searchQuery}%,Note.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setEvents(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCalendar, searchQuery, selectedUser, startDate, endDate]);

  return { events, loading };
};

export default useCalendarFilter;
