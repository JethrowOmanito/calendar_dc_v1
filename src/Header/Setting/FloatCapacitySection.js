import React, { useState, useEffect } from "react";
import supabase from "../../helper/supabaseClient"; // adjust path as needed
import './FloatCapacitySection.css';

const EXTRA_SERVICES = [
  "Tenancy/Renovation Job",
  "Deep floor scrubbing machine",
  "Housekeeping",
];

const FloatCapacitySection = ({
  onSaveCapacity,
  initialCapacities = {},
}) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedExtra, setSelectedExtra] = useState(EXTRA_SERVICES[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacities, setCapacities] = useState(initialCapacities);

  // Fetch services from DB
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from("services").select("name");
      if (!error && data) {
        setServices(data.map(s => s.name));
        setSelectedService(data[0]?.name || "");
      }
    };
    fetchServices();
  }, []);

  const handleSave = async () => {
    if (!selectedService || !selectedExtra || !selectedDate || !capacity || !startTime || !endTime) {
      alert("Please fill all fields including start and end time.");
      return;
    }

    // Insert a row into the Capacity table
    const insert = {
      date_capaticty: selectedDate,
      capacity: Number(capacity),
      calendar: null, // Set if you want to associate with a calendar
      service: selectedService,
      Start_Time: startTime,
      End_Time: endTime,
    };

    const { error } = await supabase.from("Capacity").insert([insert]);

    if (error) {
      alert("Failed to save capacity: " + error.message);
      return;
    }

    // Update local state for UI
    const key = `${selectedService}|${selectedExtra}|${selectedDate}|${startTime}|${endTime}`;
    const updated = {
      ...capacities,
      [key]: {
        capacity: Number(capacity),
        startTime,
        endTime,
      },
    };
    setCapacities(updated);
    if (onSaveCapacity) onSaveCapacity(updated);
    setCapacity("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <section className="float-capacity-section pro">
      <h3 className="float-capacity-title">Job Capacity Management</h3>
      <div className="capacity-controls">
        <label>
          <span>Calendar</span>
          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
          >
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Service</span>
          <select
            value={selectedExtra}
            onChange={e => setSelectedExtra(e.target.value)}
          >
            {EXTRA_SERVICES.map(es => (
              <option key={es} value={es}>{es}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </label>
        <label>
          <span>Start Time</span>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </label>
        <label>
          <span>End Time</span>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </label>
        <label>
          <span>Capacity Limit</span>
          <input
            type="number"
            min="0"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            placeholder="Enter limit"
          />
        </label>
        <button className="capacity-save-btn" onClick={handleSave}>Save</button>
      </div>
      <div className="capacity-summary">
        <h4>Current Limits</h4>
        <ul>
          {Object.entries(capacities).length === 0 && (
            <li className="capacity-empty"></li>
          )}
          {Object.entries(capacities).map(([key, val]) => {
            const [service, extra, date, start, end] = key.split("|");
            return (
              <li key={key}>
                <strong>{service}</strong> + <em>{extra}</em> on <u>{date}</u> [{start} - {end}]: <span className="capacity-number">{val.capacity}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default FloatCapacitySection;