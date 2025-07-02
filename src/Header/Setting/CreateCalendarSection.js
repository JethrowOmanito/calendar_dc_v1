import React, { useState } from "react";
import supabase from "../../helper/supabaseClient";
import "./CreateCalendarSection.css";
import { v4 as uuidv4 } from "uuid";

const colorOptions = [
  { name: "Mint Green", value: "#98FBCB" },
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#FF4C4C" },
  { name: "Orange", value: "#FFA500" },
  { name: "Yellow", value: "#FFEB3B" },
  { name: "Lime", value: "#B9F05E" },
  { name: "Green", value: "#4CAF50" },
  { name: "Teal", value: "#00B894" },
  { name: "Cyan", value: "#00BCD4" },
  { name: "Sky Blue", value: "#87CEEB" },
  { name: "Blue", value: "#2196F3" },
  { name: "Indigo", value: "#3F51B5" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Pink", value: "#E91E63" },
  { name: "Brown", value: "#795548" },
  { name: "Grey", value: "#9E9E9E" },
  { name: "Light Grey", value: "#ECECEC" },
  { name: "Gold", value: "#FFD700" },
  { name: "Coral", value: "#FF7F50" },
  { name: "Navy", value: "#001F54" },
  { name: "Olive", value: "#808000" },
];

const CreateCalendarSection = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("mother");
  const [color, setColor] = useState("#98FBCB");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) {
      setMessage("Please enter a calendar name.");
      return;
    }

    setLoading(true);
    setMessage("");

    // Check if a mother calendar already exists
    if (type === "mother") {
      const { data: existingMother, error: checkError } = await supabase
        .from("calendars")
        .select("*")
        .eq("type", "mother")
        .limit(1);

      if (checkError) {
        console.error(checkError);
        setMessage("❌ Error checking for existing mother calendar.");
        setLoading(false);
        return;
      }

      if (existingMother && existingMother.length > 0) {
        setMessage("⚠️ A mother calendar already exists. Only one is allowed.");
        setLoading(false);
        return;
      }
    }

    // Insert new calendar
    const newCalendar = {
      name,
      type,
      color,
      created_at: new Date().toISOString(),
      parent_id: type === "mother" ? uuidv4() : null,
    };

    const { error } = await supabase.from("calendars").insert([newCalendar]);

    if (error) {
      console.error(error);
      setMessage("❌ Failed to create calendar.");
    } else {
      setMessage("✅ Calendar created successfully.");
      setName("");
      setType("mother");
      setColor("#98FBCB");
    }

    setLoading(false);
  };

  return (
    <div className="create-calendar-container">
      <h2>Create Calendar</h2>
      <form className="form-inner" onSubmit={handleCreate} autoComplete="off">
        <div className="form-group">
          <label>Calendar Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter calendar name"
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="mother">Mother</option>
            <option value="sub">Sub</option>
          </select>
        </div>

        <div className="form-group">
          <label>Color</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <select
              value={color}
              onChange={e => setColor(e.target.value)}
              style={{
                width: 180,
                border: "none",
                background: "none",
                cursor: "pointer"
              }}
            >
              {colorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.name}
                </option>
              ))}
            </select>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="color-circle"
                style={{
                  background: color
                }}
              ></span>
              <span className="color-name">
                {colorOptions.find(opt => opt.value === color)?.name || color}
              </span>
            </span>
          </div>
        </div>

        <button
          className="create-calendar-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Calendar"}
        </button>

        {message && <p className="calendar-message">{message}</p>}
      </form>
    </div>
  );
};

export default CreateCalendarSection;