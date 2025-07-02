import React, { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaUsers } from "react-icons/fa"; // Import icons
import supabase from "../helper/supabaseClient"; // Import the existing Supabase client
import "../Header/SearchPage.css"; // Import the CSS file

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [users, setUsers] = useState([]);
  const [startDate, setStartDate] = useState(""); // Start Date state
  const [endDate, setEndDate] = useState(""); // End Date state

  // Fetch calendars and users on component mount
  useEffect(() => {
    const fetchCalendars = async () => {
      const { data, error } = await supabase.from("calendars").select("name");
      if (error) {
        console.error("Error fetching calendars:", error);
      } else {
        setCalendars(data);
      }
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase.from("user").select("username");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    };

    fetchCalendars();
    fetchUsers();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("events")
        .select("Title, Note, Start_Date, Start_Time, Service_Type") // Fetch Service_Type
        .or(`Title.ilike.%${searchQuery}%,Note.ilike.%${searchQuery}%`);

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setResults(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to truncate text to a specific number of words
  const truncateText = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  // Function to format date and time
  const formatDateTime = (date, time) => {
    if (!date || !time) return "";

    const dateObj = new Date(`${date}T${time}`);
    const options = { month: "long", day: "numeric", year: "numeric" };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${formattedDate} ${hours}:${minutes} ${period}`;
  };

  // Function to get the className for a service type
  const getServiceTypeClassName = (serviceType) => {
    switch (serviceType) {
      case "Housekeeping":
        return "event-housekeeping";
      case "Float":
        return "event-float";
      case "Curtain":
        return "event-curtain";
      case "Upholstery":
        return "event-upholstery";
      default:
        return "event-default";
    }
  };

  return (
    <div className="search-page">
      {/* Search Section */}
      <section className="search-section shadow-box">
        <div className="search-container">
          <buttons
            className="back-button"
            onClick={() => window.history.back()} // Navigate back to the previous page
          >
            ←
          </buttons>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Title or Note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Layout Container */}
      <div className="layout-container">
        {/* Results Section */}
        <div className="results-container">
          <section className="results-section">
            <h2>Search Results</h2>
            <div className="search-results">
              {results.length > 0 ? (
                results.map((event) => (
                  <div key={event.id} className="search-result-item">
                    <div className="event-details">
                      <h3
                        className={`event-titles ${getServiceTypeClassName(
                          event.Service_Type
                        )}`}
                      >
                        {event.Title}
                      </h3>
                      <p className="note-text">{truncateText(event.Note, 10)}</p>
                    </div>
                    <div className="event-start">
                      <p>{formatDateTime(event.Start_Date, event.Start_Time)}</p>
                    </div>
                  </div>
                ))
              ) : (
                !loading && <p>No results found.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Box */}
        <div className="right-box shadow-box">
          <h3 className="search-option-title">Search Option</h3>
          <form>
            <div className="search-form-group">
              <label htmlFor="calendar">
                <FaCalendarAlt className="form-icon" />
              </label>
              <select id="calendar" className="dropdown">
                <option value="">Select Calendar</option>
                {calendars.map((calendar, index) => (
                  <option key={index} value={calendar.name}>
                    {calendar.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-form-group">
              <label htmlFor="user">
                <FaUsers className="form-icon" /> 
              </label>
              <select id="user" className="dropdown">
                <option value="">Member</option>
                {users.map((user, index) => (
                  <option key={index} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-form-group date-group">
  <div className="date-field">
    <label htmlFor="start-date">Start Date</label>
    <input
      type="date"
      id="start-date"
      className="date-picker"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>
  
  {/* Arrow separator */}
  <div className="arrow-separator">
    <span>&lt;-&gt;</span>
  </div>

  <div className="date-field">
    <label htmlFor="end-date">End Date</label>
    <input
      type="date"
      id="end-date"
      className="date-picker"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
</div>


          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
