import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const getPersistentImage = (courseId) => {
    const totalImages = 3;
    const key = `course-img-${courseId}`;
    let imageIndex = localStorage.getItem(key);
    if (!imageIndex) {
      imageIndex = Math.floor(Math.random() * totalImages) + 1;
      localStorage.setItem(key, imageIndex);
    }
    return `/images/courses/${imageIndex}.jpg`;
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, [search]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses/search?q=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
       console.log("Fetched Courses:", data); // Add this
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      alert("Error fetching courses");
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEnrolledCourseIds(Array.isArray(data) ? data.map((course) => course._id) : []);
    } catch {
      console.error("Failed to fetch enrolled courses");
    }
  };

  const enroll = async () => {
    if (!enrollmentKey) return;
    try {
      const res = await fetch(`${API_BASE}/courses/${currentCourseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollmentKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSnackbar({ open: true, message: "Successfully enrolled!", severity: "success" });
      fetchEnrolledCourses();
      setShowEnrollModal(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Enrollment failed", severity: "danger" });
    }
  };

  const unenroll = async (courseId) => {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/unenroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSnackbar({ open: true, message: data.message, severity: "success" });
      fetchEnrolledCourses();
    } catch {
      setSnackbar({ open: true, message: "Unenroll failed", severity: "danger" });
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="container py-4">
      {/* Snackbar notification */}
      {snackbar.open && (
        <div className={`alert alert-${snackbar.severity} alert-dismissible`} role="alert">
          {snackbar.message}
          <button type="button" className="btn-close" onClick={() => setSnackbar({ ...snackbar, open: false })}></button>
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded shadow-sm mb-4 px-3">
        <span className="navbar-brand fw-bold fs-4">Welcome, {user.name}</span>
        <div className="d-flex justify-content-between w-100">
          <input
            type="text"
            className="form-control me-2 mb-3 mb-lg-0"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={() => navigate("/student-dashboard/my-courses")}>My Courses</button>
            <button className="btn btn-light" onClick={() => navigate("/student-dashboard/deadlines")}>Deadlines</button>
            <button className="btn btn-light" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="row">
        {courses.length === 0 ? (
          <p className="text-muted">No courses found.</p>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src={getPersistentImage(course._id)}
                  className="card-img-top"
                  alt="Course"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <p className="text-muted">Teacher: {course.teacher?.name || "N/A"}</p>

                  {enrolledCourseIds.includes(course._id) ? (
                    <>
                      <button className="btn btn-danger me-2" onClick={() => unenroll(course._id)}>Unenroll</button>
                      <button className="btn btn-outline-primary" onClick={() => navigate(`/course/${course._id}`)}>View Details</button>
                    </>
                  ) : (
                    <button className="btn btn-success" onClick={() => { setShowEnrollModal(true); setCurrentCourseId(course._id); }}>Enroll</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Enrollment Key</h5>
                <button type="button" className="btn-close" onClick={() => setShowEnrollModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enrollment Key"
                  value={enrollmentKey}
                  onChange={(e) => setEnrollmentKey(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEnrollModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={enroll}>Enroll</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
