import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import CustomCalendar from "./CustomCalendar";
import Weekly from "../WeeklyCalendar/Weekly";
import Header from "../Header/Header";
import "./Dashboard_css/Dashboard.css";
import "./Dashboard_css/sidebar.css";
import useCurrentMonth from "../hooks/useCurrentMonth";
import CreateEvent from "../Dashboard/CreateEvent/CreateEvent";
import useLogout from "../AuthService/Logout/logout"; // Correct relative path
import { Navigate } from "react-router-dom"; // Import Navigate for redirection
import EventDetails from "./EventDetails"; // Import EventDetails component
import ViewEvents from "./ViewEvents"; // Import ViewEvents component
import supabase from "../helper/supabaseClient"; // Import Supabase client

const Dashboard = ({ setUser, user }) => {
  const { currentMonth, goToPreviousMonth, goToNextMonth } = useCurrentMonth();
  const [view, setView] = useState("monthly");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState("Mother Calendar");
  const [selectedEvent, setSelectedEvent] = useState(null); // Track the selected event
  const [currentDate, setCurrentDate] = useState(null); // Track the selected date
  const [notifications, setNotifications] = useState([]); // State for notifications
  const handleLogout = useLogout(setUser);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const deleteEvent = (eventId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  };
  const addNewEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  const [capacityLimits, setCapacityLimits] = useState([]);

useEffect(() => {
  const fetchCapacityLimits = async () => {
    const { data, error } = await supabase.from("Capacity").select("*");
    if (!error && data) setCapacityLimits(data);
  };
  fetchCapacityLimits();
}, []);

  const fetchEvents = async () => {
    console.log("Fetching events...");
    try {
      const response = await fetch("/api/events"); // Replace with your actual API endpoint
      if (!response.ok) {
        throw new Error(`Failed to fetch events. Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched events:", data); // Debug log
  
      if (user.privilege >= 3) {
        // Users with privilege 3 or higher see all events
        setEvents(data);
      } else if (user.privilege === 2) {
        // Team leader: see own and team members' events
        const teamMemberNames = Array.isArray(user.teams) ? user.teams : [];
        const filteredEvents = data.filter((event) => {
          const assigned = Array.isArray(event.Assign_Cleaner) ? event.Assign_Cleaner : [];
          return (
            assigned.includes(user.username) ||
            assigned.some((name) => teamMemberNames.includes(name))
          );
        });
        setEvents(filteredEvents);
      }else {
        // Non-admin users see only events assigned to them
        const filteredEvents = data.filter((event) => {
          return Array.isArray(event.service_assigned) && event.service_assigned.includes(user.username);
        });
        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleCloseEventDetails = () => {
    setSelectedEvent(null); // Reset the selected event
  };
  const handleEventClick = (event) => {
    setSelectedEvent(event); // Set the clicked event as the selected event
  };
  const handleCalendarSelect = (calendarNameOrEvents) => {
    if (Array.isArray(calendarNameOrEvents)) {
      // If events are passed, update the events state
      setEvents(calendarNameOrEvents);
    } else {
      // If a calendar name is passed, update the selected calendar
      setSelectedCalendar(calendarNameOrEvents);

      // Optionally clear the events while waiting for new data
      setEvents([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Request notification permissions
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          console.warn("Notification permission denied.");
        }
      });
    }
  }, []);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!user) return;
  
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          console.log("Real-time notification received:", payload); // Debug log
          if (payload.new.user_id === user.id) {
            setNotifications((prev) => [payload.new, ...prev]);
  
            if (Notification.permission === "granted") {
              new Notification("New Notification", {
                body: payload.new.message,
              });
            }
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);


  // Real-time subscription for events
// Real-time subscription for events
useEffect(() => {
  if (!user) return;

  const channel = supabase
    .channel("events-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "events" },
      (payload) => {
        console.log("Real-time event received:", payload);

        setEvents((prev) => {
          if (payload.eventType === "INSERT") {
            // Prevent duplicate
            if (prev.some(ev => ev.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          }
          if (payload.eventType === "UPDATE") {
            // Update the event in the list
            return prev.map(ev => ev.id === payload.new.id ? payload.new : ev);
          }
          if (payload.eventType === "DELETE") {
            // Remove the deleted event
            return prev.filter(ev => ev.id !== payload.old.id);
          }
          return prev;
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

  // Additional filtering logic for events based on selected calendar.
  const filteredEvents = events
    .map((event) => {
      if (selectedCalendar === "Mother Calendar") {
        return event; // Include all events for Mother Calendar
      } else if (event.Service_Type === selectedCalendar) {
        return event; // Include only events matching the selected calendar
      }
      return null; // Exclude events that don't match
    })
    .filter(Boolean); // Remove null values

    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    return (
      <div className="dashboard">
        {/* Header with Month Navigation */}
        <Header
          currentMonth={currentMonth}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          view={view}
          setView={setView}
          setShowCreateEvent={setShowCreateEvent}
          onLogout={handleLogout}
          user={user || {}} 
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />
    
        {/* Dashboard Container */}
        <div className={`dashboard-container ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
          {/* Sidebar with calendar selection */}
          <Sidebar
            user={user}
            onCalendarSelect={handleCalendarSelect}
            expanded={sidebarExpanded}
          />
    
          {/* Main Content */}
          <div className="calendar-container">
            {selectedEvent ? (
              <EventDetails
                event={selectedEvent}
                onClose={handleCloseEventDetails}
                onEventUpdate={(updatedEvent) => setSelectedEvent(updatedEvent)}
                onDeleteEvent={deleteEvent}
              />
            ) : view === "monthly" ? (
              <CustomCalendar
                currentMonth={currentMonth}
                events={filteredEvents}
                fetchEvents={fetchEvents}
                user={user}
                onEventClick={handleEventClick}
                deleteEvent={deleteEvent}
                capacityLimits={capacityLimits}
              />
            ) : (
              <Weekly events={filteredEvents} user={user} />
            )}
    
            {/* View Events for Selected Date */}
            <ViewEvents
              events={filteredEvents.filter(
                (event) => event.Start_Date === currentDate
              )}
              selectedDate={currentDate}
              onEventClick={handleEventClick}
            />
          </div>
        </div>
    
        {/* Show CreateEvent panel when open */}
        {showCreateEvent && (
          <CreateEvent
            setShowCreateEvent={setShowCreateEvent}
            addNewEvent={addNewEvent}
            fetchEvents={fetchEvents}
            user={user}
          />
        )}
    
        {/* Notification Popup */}
        {notifications.length > 0 && (
          <div className="notification-popup">
            <button
              className="close-btn"
              onClick={() => setNotifications([])}
            >
              ✖
            </button>
            <h3>Notifications</h3>
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
};

export default Dashboard;