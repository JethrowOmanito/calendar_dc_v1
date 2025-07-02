import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import "./DeletedJobs.css";

const DeletedJobs = () => {
  const [deletedJobs, setDeletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  // Fetch jobs function
  const fetchDeletedJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Deleted_Job")
      .select("id, Title, Service_Type, Start_Date, End_Date, created_By, date_Created, Note");
    setDeletedJobs(error ? [] : data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeletedJobs();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('deleted_job_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Deleted_Job' },
        () => {
          fetchDeletedJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle select/deselect
  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === deletedJobs.length) {
      setSelected([]);
    } else {
      setSelected(deletedJobs.map((job) => job.id));
    }
  };

  // Permanently delete selected jobs
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm("Are you sure you want to permanently delete the selected jobs?")) return;
    setLoading(true);
    await supabase.from("Deleted_Job").delete().in("id", selected);
    setSelected([]);
    fetchDeletedJobs();
  };

  // Permanently delete all jobs
  const handleDeleteAll = async () => {
    if (deletedJobs.length === 0) return;
    if (!window.confirm("Are you sure you want to permanently delete ALL deleted jobs?")) return;
    setLoading(true);
    await supabase.from("Deleted_Job").delete().neq("id", ""); // delete all
    setSelected([]);
    fetchDeletedJobs();
  };

// ...existing imports and logic...

return (
  <div className="deleted-jobs-list-container">
    <h3>Deleted Jobs</h3>
    <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
      <button onClick={handleSelectAll}>
        {selected.length === deletedJobs.length ? "Deselect All" : "Select All"}
      </button>
      <button onClick={handleDeleteSelected} disabled={selected.length === 0}>
        Delete Selected
      </button>
      <button onClick={handleDeleteAll} disabled={deletedJobs.length === 0}>
        Delete All
      </button>
    </div>
    <div className="deleted-jobs-header-row">
      <div>
        <input
          type="checkbox"
          checked={selected.length === deletedJobs.length && deletedJobs.length > 0}
          onChange={handleSelectAll}
        />
      </div>
      <div>Title</div>
      <div>Service</div>
      <div>Start</div>
      <div>End</div>
      <div>Deleted By</div>
      <div>Deleted On</div>
      <div>Note</div>
    </div>
    {loading ? (
      <p>Loading...</p>
    ) : deletedJobs.length === 0 ? (
      <p>No deleted jobs found.</p>
    ) : (
      <div className="deleted-jobs-list">
        {deletedJobs.map((job) => (
          <div key={job.id} className="deleted-job-item-row">
            <div>
              <input
                type="checkbox"
                checked={selected.includes(job.id)}
                onChange={() => handleSelect(job.id)}
              />
            </div>
            <div><strong>{job.Title}</strong></div>
            <div className="service-type">{job.Service_Type}</div>
            <div>{job.Start_Date}</div>
            <div>{job.End_Date}</div>
            <div className="deleted-by">{job.created_By || "Unknown"}</div>
            <div className="deleted-date">
              {job.date_Created ? new Date(job.date_Created).toLocaleDateString() : "Unknown"}
            </div>
            <div className="deleted-note">{job.Note}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default DeletedJobs;