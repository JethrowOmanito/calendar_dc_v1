import React, { useEffect, useState } from "react";
import { format, addDays, startOfWeek, isSameDay, parse } from "date-fns";
import supabase from "../helper/supabaseClient";
import "./Weekly.css";

const Weekly = ({ user }) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)); // Monday to Sunday

    // Time slots from 12 AM to 11 PM
    const timeSlots = Array.from({ length: 24 }, (_, i) =>
        `${i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}`
    );

    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!user) return; // Prevent running if user is not loaded yet

        const fetchEvents = async () => {
            const start = format(weekStart, "yyyy-MM-dd");
            const end = format(addDays(weekStart, 6), "yyyy-MM-dd");

            let query = supabase
                .from("events")
                .select("*")
                .gte("Start_Date", start)
                .lte("Start_Date", end);

            // Filter by user privilege (similar to your main calendar)
            if (user.privilege >= 3) {
                // Admin: see all
            } else if (user.privilege === 2) {
                const username = String(user.username).trim();
                const teamMemberNames = Array.isArray(user.teams)
                    ? user.teams.map(String).map(s => s.trim())
                    : [];
                if (teamMemberNames.length > 0) {
                    query = query.or(
                        `Assign_Cleaner.cs.{${username}},Assign_Cleaner.ov.{${teamMemberNames.join(",")}}`
                    );
                } else {
                    query = query.contains("Assign_Cleaner", [username]);
                }
            } else {
                query = query.contains("Assign_Cleaner", [user.username]);
            }

            const { data, error } = await query;
            if (!error) setEvents(data || []);
        };

        fetchEvents();
    }, [weekStart, user]);

    // Helper: get all events for a specific day and time slot
    const getEventsForSlot = (day, time) => {
        // Convert time slot to 24h for comparison
        let [slotHour, slotPeriod] = time.split(" ");
        slotHour = parseInt(slotHour, 10);
        if (slotPeriod === "PM" && slotHour !== 12) slotHour += 12;
        if (slotPeriod === "AM" && slotHour === 12) slotHour = 0;
    
        // Slot start and end in minutes
        const slotStart = slotHour * 60;
        const slotEnd = slotStart + 60;
    
        return events.filter(event => {
            // Parse event start and end date/time
            const eventStartDate = parse(event.Start_Date, "yyyy-MM-dd", new Date());
            const eventEndDate = event.End_Date
                ? parse(event.End_Date, "yyyy-MM-dd", new Date())
                : eventStartDate;
    
            const [startHour, startMin] = event.Start_Time.split(":").map(Number);
            const [endHour, endMin] = event.End_Time.split(":").map(Number);
    
            // Event start and end in minutes since midnight
            let eventStart = startHour * 60 + (startMin || 0);
            let eventEnd = endHour * 60 + (endMin || 0);
    
            // If event ends before it starts, it's overnight
            const isOvernight = eventEnd <= eventStart;
    
            // If this slot's day is the event start day
            if (isSameDay(eventStartDate, day)) {
                if (!isOvernight) {
                    // Normal event: same day
                    return eventStart < slotEnd && eventEnd > slotStart;
                } else {
                    // Overnight event: show on start day from start to midnight
                    return eventStart < slotEnd && 1440 > slotStart;
                }
            }
    
            // If this slot's day is the event end day (for overnight events)
            if (isOvernight && isSameDay(eventEndDate, day)) {
                // Show on end day from midnight to eventEnd
                return 0 < slotEnd && eventEnd > slotStart;
            }
    
            // If this slot's day is between start and end (for multi-day events)
            if (
                isOvernight &&
                day > eventStartDate &&
                day < eventEndDate
            ) {
                // Show full day
                return true;
            }
    
            return false;
        });
    };

    return (
        <div className="weekly-container">
            <p>Week: {format(weekStart, "MMMM dd")} - {format(weekDays[6], "MMMM dd, yyyy")}</p>

            <div className="weekly-box">
                {/* Days Header */}
                <div className="week-header">
                    <div className="time-column-header"></div>
                    {weekDays.map((day, index) => (
                        <div key={index} className="day-header">
                            <span className={`day-number ${isSameDay(day, today) ? "today" : ""}`}>
                                {format(day, "EEE dd")}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Main Grid Layout */}
                <div className="weekly-grid">
                    {timeSlots.map((time, rowIndex) => (
                        <div key={rowIndex} className="week-row">
                            {/* Time Slot */}
                            <div className="time-slot">{time}</div>

                            {/* Day Slots */}
                            {weekDays.map((day, colIndex) => {
                                const eventsForSlot = getEventsForSlot(day, time);
                                return (
                                    <div key={colIndex} className="day-time-slot">
                                        {eventsForSlot.length > 0 &&
                                            eventsForSlot.map(ev => (
                                                <span className="job" key={ev.id}>{ev.Title}</span>
                                            ))
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Weekly;