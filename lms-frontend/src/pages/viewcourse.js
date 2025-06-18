import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function ViewCourse() {
  const { id } = useParams();  
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); 

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchViewCourse = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setCourse(data);
        } else {
          setError(data.message || "Error loading course details.");
        }
      } catch (err) {
        setError("Error fetching course data.");
        console.error(err);
      }
    };

    fetchViewCourse();
  }, [id, token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!course) {
    return <div className="spinner-border text-dark" />;
  }

  const getTabStyle = (tabName) => {
    return activeTab === tabName
      ? { ...styles.navLink, fontWeight: "bold", backgroundColor: "#343a40", color: "white" }
      : { ...styles.navLink, color: "#6c757d" };
  };

  return (
    <div className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded shadow-sm mb-4 px-3">
        <span className="navbar-brand fw-bold fs-4">{course.title}</span>
        <div className="ms-auto">
          <button className="btn btn-light" onClick={() => window.history.back()}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>
      </nav>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ marginBottom: "20px" }}>
        <nav className="nav nav-pills bg-light rounded p-2 mb-4 shadow-sm">
          <Link to="#" onClick={() => setActiveTab("home")} style={getTabStyle("home")} className="nav-link">
            Home
          </Link>
          <Link to="#" onClick={() => setActiveTab("assignments")} style={getTabStyle("assignments")} className="nav-link">
            Assignments
          </Link>
          <Link to="#" onClick={() => setActiveTab("participants")} style={getTabStyle("participants")} className="nav-link">
            Participants
          </Link>
          <Link to="#" onClick={() => setActiveTab("info")} style={getTabStyle("info")} className="nav-link">
            Info
          </Link>
        </nav>
      </div>

    
{activeTab === "home" && (
  <div>
    <h3>Materials</h3>
    {course.materials && course.materials.length > 0 ? (
      <div className="row">
        {course.materials.map((m, i) => (
          <div className="col-md-4 mb-4" key={i}>
            <div className="card shadow-sm h-100 border-1">
              <div className="card-body">
                <h5 className="card-title">{m.title}</h5>
                <p className="card-text text-muted" style={{ minHeight: "50px" }}>
                  {m.description || "No description"}
                </p>
              </div>
              <div className="card-footer bg-white border-top-0">
                {m.filePath && (
                  <a
                    href={`http://localhost:5000/api/uploads/${m.filePath.split("/").pop()}`}
                    download
                    className="btn btn-sm btn-outline-primary"
                  >
                    📥 Download
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p>No materials available.</p>
    )}
  </div>
)}


      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div>
          <h3>Assignments</h3>
          {course.assignments && course.assignments.length > 0 ? (
            <ul>
              {course.assignments.map((a, i) => (
                <li key={i}>
                  <strong>{a.title}</strong> — Deadline: {new Date(a.deadline).toLocaleString()}
                  <br />
                  File: <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-decoration-none">Download</a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No assignments available.</p>
          )}
        </div>
      )}

{activeTab === "participants" && (
  <div>
    <h3>Participants</h3>
    {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
      <div className="row">
        {course.enrolledStudents.map((student) => (
          <div className="col-md-4 mb-3" key={student._id}>
            <div className="card h-100 border-1 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
                  style={{ width: "50px", height: "50px", fontSize: "20px" }}
                >
                  {student.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h6 className="mb-0">{student.name}</h6>
                  <small className="text-muted">{student.email || "No email provided"}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted">No students enrolled in this course.</p>
    )}
  </div>
)}


{activeTab === "info" && (
  <div>
    <h3 className="mb-4">📘 Course Info</h3>

    <div className="alert alert-secondary d-flex align-items-center" role="alert">
      <i className="bi bi-person-circle fs-4 me-3"></i>
      <div>
        <strong>Teacher:</strong> {course.teacher?.name || "N/A"}
        {course.teacher?.email && (
  <div className="mt-1">
    📧 Gmail:{" "}
    <a
      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${course.teacher.email}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-decoration-none"
      style={{ color: "#0d6efd" }}
    >
      {course.teacher.email}
    </a><br/>
    <p>contact me via above gmail</p>
  </div>
)}

      </div>
    </div>

    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title">📝 Description</h5>
        <p className="card-text text-muted" style={{ whiteSpace: "pre-line" }}>
          {course.description || "No description provided."}
        </p>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    gap: "15px",
    fontSize: "18px",
    marginBottom: "20px",
  },
  navLink: {
    textDecoration: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    color: "#6c757d",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};
