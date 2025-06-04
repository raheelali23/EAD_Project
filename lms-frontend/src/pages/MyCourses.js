import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loadAll = async () => {
    try {
      const [allCourses, enrolled] = await Promise.all([
        fetch(`${API_BASE}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
        fetch(`${API_BASE}/courses/student/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
      ]);
      setCourses(Array.isArray(allCourses) ? allCourses : []);
      setEnrolledCourseIds(Array.isArray(enrolled) ? enrolled.map((c) => c._id) : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      alert("Error loading courses.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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
      alert(data.message);
      loadAll(); // Refresh the course list after unenrollment
    } catch {
      alert("Unenroll failed");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">My Courses</h2>

      {/* Back Button */}
      <button 
        onClick={() => navigate("/")}  // Navigate to the home page
        className="btn btn-secondary mb-4"
        style={{ backgroundColor: "#6c63ff", color: "white" }}
      >
        Back to Home
      </button>

      {courses.filter((c) => enrolledCourseIds.includes(c._id)).map((course) => (
        <div key={course._id} className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h3 className="card-title">{course.title}</h3>
            <p>{course.description}</p>

            <div className="d-flex gap-2">
              <button
                onClick={() => navigate(`/course/${course._id}`)} // Navigate to course detail page
                className="btn"
                style={{ backgroundColor: "#6c63ff", color: "white" }}
              >
                View Details
              </button>
              <button
                onClick={() => unenroll(course._id)} // Unenroll from course
                className="btn"
                style={{ backgroundColor: "#dc3545", color: "white" }}
              >
                Unenroll
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
