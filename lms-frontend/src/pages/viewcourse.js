import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function ViewCourse() {
  const { id } = useParams();  // Get the course ID from the URL
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");  // Default tab is "home"

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

      {/* Error Handling */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <nav className="nav nav-pills bg-light rounded p-2 mb-4 shadow-sm">
          <Link to="#" onClick={() => setActiveTab("home")} style={getTabStyle("home")} className="nav-link">
            Home
          </Link>
          <Link to="#" onClick={() => setActiveTab("participants")} style={getTabStyle("participants")} className="nav-link">
            Participants
          </Link>
          <Link to="#" onClick={() => setActiveTab("info")} style={getTabStyle("info")} className="nav-link">
            Info
          </Link>
        </nav>
      </div>

      {/* Home Tab */}
      {activeTab === "home" && (
        <div>
          <h3>Materials</h3>
          {course.materials && course.materials.length > 0 ? (
            <ul>
              {course.materials.map((m, i) => (
                <li key={i}>
                  {m.title} - {m.description || "No description"}
                  {m.filePath && (
                    <>
                      {" "}
                      —{" "}
                      <a
                        href={`${API_BASE}${m.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        Download
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No materials available.</p>
          )}

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

      {/* Participants Tab */}
      {activeTab === "participants" && (
        <div>
          <h3>Participants</h3>
          {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
            <ul>
              {course.enrolledStudents.map((student) => (
                <li key={student._id}>{student.name}</li>
              ))}
            </ul>
          ) : (
            <p>No students enrolled in this course.</p>
          )}
        </div>
      )}

      {/* Info Tab */}
      {activeTab === "info" && (
        <div>
          <h3>Course Info</h3>
          <p><strong>Teacher:</strong> {course.teacher?.name || "N/A"}</p>
          <p><strong>Description:</strong> {course.description || "No description provided."}</p>
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
    color: "#6c757d", // Default text color
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};
