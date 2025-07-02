import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import {
  FaUser, FaLock, FaPalette, FaUserTag, FaVenusMars, FaBroom, FaPhone, FaIdBadge
} from "react-icons/fa";
import "./RegisterCleanerSection.css";

const colorOptions = [
  { name: "Red Orange", value: "#FF5733" },
  { name: "Lime Green", value: "#33FF57" },
  { name: "Royal Blue", value: "#3357FF" },
  { name: "Yellow", value: "#FFC300" },
  { name: "Mint", value: "#DAF7A6" },
  { name: "Crimson", value: "#C70039" },
  { name: "Dark Red", value: "#900C3F" },
  { name: "Eggplant", value: "#581845" },
  { name: "Magenta", value: "#FF33FF" },
  { name: "Cyan", value: "#33FFFF" },
  { name: "Bright Red", value: "#FF3333" },
  { name: "Bright Green", value: "#33FF33" },
  { name: "Bright Blue", value: "#3333FF" },
  { name: "Orange", value: "#FF9933" },
  { name: "Light Green", value: "#66FF66" },
  { name: "Violet", value: "#9933FF" },
  { name: "Pink", value: "#FF6699" },
  { name: "Aqua", value: "#66FFFF" },
  { name: "Gold", value: "#FFCC33" },
  { name: "Rose", value: "#FF3366" }
];

const RegisterCleanerSection = () => {
  // UI fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [number, setNumber] = useState("");
  // Supabase fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [privilege, setPrivilege] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [services, setServices] = useState([]);
  const [colorLabel, setColorLabel] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from("services").select("name");
      if (!error && data) setServices(data);
    };
    fetchServices();
  }, []);

  const handleServiceAdd = () => {
    if (selectedService && !selectedServices.includes(selectedService)) {
      setSelectedServices([...selectedServices, selectedService]);
    }
    setSelectedService("");
  };

  const handleServiceRemove = (service) => {
    setSelectedServices(selectedServices.filter((s) => s !== service));
  };

  const handleRegister = async () => {
    if (!username || !password || selectedServices.length === 0) {
      setMessage("❌ Username, Password, and Service are required.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.from("user").insert([
      {
        username,
        password,
        role: "cleaner",
        service_assigned: selectedServices,
        privilege: parseInt(privilege),
        color_label: colorLabel,
      },
    ]);
    if (error) {
      setMessage("❌ Failed to register cleaner.");
    } else {
      setMessage("✅ Cleaner registered successfully.");
      setName(""); setGender(""); setPhone(""); setNumber("");
      setUsername(""); setPassword(""); setSelectedServices([]);
      setPrivilege("1"); setColorLabel("");
    }
    setLoading(false);
  };

  return (
    <div className="register-cleaner-container">
      <h2>
        <FaBroom style={{ marginRight: 8, color: "#28a745" }} />
        Register New Cleaner
      </h2>
      <form
        className="form-grid"
        onSubmit={e => { e.preventDefault(); handleRegister(); }}
        autoComplete="off"
      >
        {/* Row 1: Name / Gender */}
        <div>
          <label className="register-cleaner-label">
            <FaUser className="input-icon" /> Name
          </label>
          <input
            className="register-cleaner-input"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="register-cleaner-label">
            <FaVenusMars className="input-icon" /> Gender
          </label>
          <select
            className="register-cleaner-select"
            value={gender}
            onChange={e => setGender(e.target.value)}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        {/* Row 2: Phone / Username */}
        <div>
          <label className="register-cleaner-label">
            <FaPhone className="input-icon" /> Phone
          </label>
          <input
            className="register-cleaner-input"
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="register-cleaner-label">
            <FaUserTag className="input-icon" /> Username
          </label>
          <input
            className="register-cleaner-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        {/* Row 3: Number / Password */}
        <div>
          <label className="register-cleaner-label">
            <FaIdBadge className="input-icon" /> Number
          </label>
          <input
            className="register-cleaner-input"
            type="text"
            placeholder="Number"
            value={number}
            onChange={e => setNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="register-cleaner-label">
            <FaLock className="input-icon" /> Password
          </label>
          <input
            className="register-cleaner-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {/* Row 4: Service / Privilege */}
        <div>
          <label className="register-cleaner-label">
            <FaBroom className="input-icon" /> Service
          </label>
          <div className="service-selection">
            <select
              className="register-cleaner-select"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              <option value="">Select Service</option>
              {services.map((service, idx) => (
                <option key={idx} value={service.name}>{service.name}</option>
              ))}
            </select>
            <button
              className="add-service-btn"
              type="button"
              onClick={handleServiceAdd}
              title="Add Service"
            >
              ＋
            </button>
          </div>
          {selectedServices.length > 0 && (
            <div className="selected-service-pills" style={{ marginTop: 4 }}>
              {selectedServices.map((service, idx) => (
                <span className="pill" key={idx}>
                  {service}
                  <button type="button" onClick={() => handleServiceRemove(service)}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="register-cleaner-label">
            <FaUserTag className="input-icon" /> Privilege
          </label>
          <select
            className="register-cleaner-select"
            value={privilege}
            onChange={e => setPrivilege(e.target.value)}
          >
            <option value="1">Staff</option>
            <option value="2">Team Leader</option>
            <option value="3">Admin</option>
            <option value="4">Super Account</option>
          </select>
        </div>
        {/* Row 5: Label (full width) */}
        <div style={{ gridColumn: "1 / span 2" }}>
          <label className="register-cleaner-label">
            <FaPalette className="input-icon" /> Label
          </label>
          <div className="color-selection-container">
            <select
              className="color-dropdown"
              value={colorLabel}
              onChange={e => setColorLabel(e.target.value)}
            >
              <option value="">Select a Color</option>
              {colorOptions.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.name}
                </option>
              ))}
            </select>
            <span className="color-label-preview" title={colorLabel}>
              <span
                className="color-circle"
                style={{ background: colorLabel }}
              ></span>
              <span className="color-name">
                {colorOptions.find(opt => opt.value === colorLabel)?.name || colorLabel}
              </span>
            </span>
          </div>
        </div>
        {/* Submit button (full width) */}
        <div style={{ gridColumn: "1 / span 2" }}>
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register Cleaner"}
          </button>
          {message && <p className="register-message">{message}</p>}
        </div>
      </form>
    </div>
  );
};

export default RegisterCleanerSection;