import React, { useState, useEffect } from "react";
import supabase from "../../helper/supabaseClient";
import "./RegisterServiceSection.css";

const RegisterServiceSection = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingServices, setExistingServices] = useState([]);

  useEffect(() => {
    // Fetch existing services for validation
    const fetchServices = async () => {
      const { data, error } = await supabase.from("services").select("name");
      if (!error && data) {
        setExistingServices(data.map((service) => service.name.toLowerCase()));
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("⚠️ Service name cannot be empty.");
      return;
    }

    if (existingServices.includes(name.toLowerCase())) {
      setMessage("⚠️ This service already exists.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("services").insert([{ name }]);

    if (error) {
      console.error(error);
      setMessage("❌ Failed to register service.");
    } else {
      setMessage("✅ Service registered successfully.");
      setExistingServices([...existingServices, name.toLowerCase()]);
      setName("");
    }

    setLoading(false);
  };

  return (
    <div className="register-service-container">
      <h2>Register New Service</h2>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div className="form-group">
          <label>Service Name</label>
          <input
            type="text"
            placeholder="e.g., Upholstery Cleaning"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          className="service-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Service"}
        </button>
        {message && <p className="service-message">{message}</p>}
      </form>
    </div>
  );
};

export default RegisterServiceSection;