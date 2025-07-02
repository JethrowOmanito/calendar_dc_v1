import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import * as XLSX from "xlsx";
import "./ConvertExcel.css";

const ConvertExcel = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("Service_Type")
        .neq("Service_Type", null);

      if (error) {
        console.error("Failed to fetch services:", error);
        return;
      }

      const uniqueServices = Array.from(new Set(data.map(item => item.Service_Type)));
      setServices(uniqueServices);
    };

    fetchServices();
  }, []);

  function timeToMinutes(time) {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  function formatMinutes(mins) {
    if (mins === 0) return "0";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m ? ` ${m}m` : ""}`;
  }

  const formatTo12Hour = time => {
    if (!time) return "N/A";
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDownload = async () => {
    if (!selectedService || !startMonth || !endMonth) {
      alert("Please select service and date range.");
      return;
    }

    setLoading(true);

    const startDate = new Date(startMonth);
    const endDate = new Date(endMonth);
    endDate.setMonth(endDate.getMonth() + 1); // Include end month

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("Service_Type", selectedService)
      .gte("Start_Date", startDate.toISOString())
      .lte("End_Date", endDate.toISOString());

    if (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      return;
    }

    // Flatten all events by day and cleaner
    const dayCleanerMap = {};
    data.forEach(item => {
      if (!item.Assign_Cleaner || !Array.isArray(item.Assign_Cleaner)) return;
      const dateStr = new Date(item.Start_Date).toISOString().slice(0, 10);
      item.Assign_Cleaner.forEach(cleaner => {
        const key = `${cleaner}__${dateStr}`;
        if (!dayCleanerMap[key]) {
          dayCleanerMap[key] = {
            date: dateStr,
            cleaner,
            slots: [],
            mins: 0,
          };
        }
        const startMins = timeToMinutes(item.Start_Time);
        const endMins = timeToMinutes(item.End_Time);
        let duration = endMins - startMins;
        if (duration < 0) duration += 24 * 60;
        dayCleanerMap[key].slots.push(`${formatTo12Hour(item.Start_Time)} - ${formatTo12Hour(item.End_Time)}`);
        dayCleanerMap[key].mins += duration;
      });
    });

    // Group by cleaner, sort by date
    const cleanerDays = {};
    Object.values(dayCleanerMap).forEach(entry => {
      if (!cleanerDays[entry.cleaner]) cleanerDays[entry.cleaner] = [];
      cleanerDays[entry.cleaner].push(entry);
    });
    Object.values(cleanerDays).forEach(arr => arr.sort((a, b) => a.date.localeCompare(b.date)));

    // Build rows: 7 days per chunk, then total/OT row
    const rows = [];
    Object.entries(cleanerDays).forEach(([cleaner, days]) => {
      let chunk = [];
      let chunkMins = 0;
      days.forEach((entry, idx) => {
        chunk.push({
          Date: entry.date,
          Cleaner: cleaner,
          "Start & End Time": entry.slots.join("\n"),
          Hrs: formatMinutes(entry.mins),
        });
        chunkMins += entry.mins;
        // If 7 days or last day, push total/OT and reset
        const isLast = idx === days.length - 1;
        if ((chunk.length === 7) || isLast) {
          rows.push(...chunk);
          rows.push({
            Date: "Total",
            Cleaner: "",
            "Start & End Time": "",
            Hrs: formatMinutes(Math.min(chunkMins, 44 * 60)),
          });
          rows.push({
            Date: "OT",
            Cleaner: "",
            "Start & End Time": "",
            Hrs: formatMinutes(Math.max(chunkMins - 44 * 60, 0)),
          });
          chunk = [];
          chunkMins = 0;
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Service Report");
    XLSX.writeFile(workbook, `Report_${selectedService}.xlsx`);

    setLoading(false);
  };

  return (
    <div className="convert-excel-container">
      <button className="back-arrow-circle" onClick={() => navigate("/dashboard")}>
        ←
      </button>
      <h2>Monthly Service Report</h2>

      <form className="convert-excel-form">
        <div className="form-group">
          <label>Select Service</label>
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
            <option value="">-- Choose Service --</option>
            {services.map(service => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Start Month</label>
          <input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)} />
        </div>

        <div className="form-group">
          <label>End Month</label>
          <input type="month" value={endMonth} onChange={e => setEndMonth(e.target.value)} />
        </div>

        <button
          onClick={e => { e.preventDefault(); handleDownload(); }}
          disabled={loading}
          className="download-btn"
          type="submit"
        >
          {loading ? "Generating..." : "⬇️ Download Excel"}
        </button>
      </form>
    </div>
  );
};

export default ConvertExcel;