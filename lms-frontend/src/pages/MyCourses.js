import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Reuse thumbnail for each course
  const getPersistentImage = (courseId) => {
    const totalImages = 4;
    const key = `course-img-${courseId}`;
    let imageIndex = localStorage.getItem(key);
    if (!imageIndex) {
      imageIndex = Math.floor(Math.random() * totalImages) + 1;
      localStorage.setItem(key, imageIndex);
    }
    return `/images/courses/${imageIndex}.jpg`;
  };

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
      loadAll();
    } catch {
      alert("Unenroll failed");
    }
  };

  return (
    <div className="container py-4">
      {/* Black Navbar Style */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded shadow-sm mb-4 px-3">
        <span className="navbar-brand fw-bold fs-4">📚 My Enrolled Courses</span>
        <div className="ms-auto">
          <button
            onClick={() => navigate("/student-dashboard")}
            className="btn btn-light"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="row">
        {courses.filter((c) => enrolledCourseIds.includes(c._id)).length === 0 ? (
          <p className="text-muted">You are not enrolled in any courses yet.</p>
        ) : (
          courses
            .filter((c) => enrolledCourseIds.includes(c._id))
            .map((course) => (
              <div key={course._id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src={getPersistentImage(course._id)}
                    alt="Course"
                    className="card-img-top"
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-dark">{course.title}</h5>
                    <p className="card-text text-muted" style={{ flexGrow: 1 }}>
                      {course.description || "No description provided."}
                    </p>
                    <p className="small text-secondary">👨‍🏫 {course.teacher?.name || "Unknown Teacher"}</p>
                    <div className="mt-auto d-flex justify-content-between">
                      <button
                        onClick={() => navigate(`/course/${course._id}`)}
                        className="btn btn-sm btn-dark"
                      >
                         View Details
                      </button>
                      <button
                        onClick={() => unenroll(course._id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                         Unenroll
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
