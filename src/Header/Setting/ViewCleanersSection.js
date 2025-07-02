import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import "./ViewCleanersSection.css";

const ViewCleanersSection = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch rows from 'services' table
  const fetchServices = async () => {
    const { data, error } = await supabase.from("services").select("*");
    if (error) {
      console.error("Error fetching services:", error);
    } else {
      setServices(data);
    }
  };

  // ✅ Fetch users whose service_assigned contains selected service
  const fetchUsersByService = async (serviceName) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user")
      .select("username, role, service_assigned, privilege")
      .contains("service_assigned", [serviceName]); // match array

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchUsersByService(selectedService);
    } else {
      setUsers([]);
    }
  }, [selectedService]);

  return (
    <div className="view-cleaners-container">
      <h2>View Users by Service</h2>

      <div className="form-group">
        <label>Select a Service</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">-- Select Service --</option>
          {services.map((service, index) => (
            <option key={index} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading users...</p>}

      {!loading && selectedService && (
        <>
          <h3>Users Assigned to "{selectedService}"</h3>
          {users.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Service Assigned</th>
                  <th>Privilege</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>{user.service_assigned.join(", ")}</td>
                    <td>{user.privilege ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No users found for this service.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ViewCleanersSection;
