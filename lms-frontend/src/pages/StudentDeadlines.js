import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { MdOutlineAccessTime, MdDownload, MdArrowBack } from "react-icons/md"; 
import { useNavigate } from "react-router-dom"; 

export default function StudentDeadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses/student/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const courses = await res.json();

        const allDeadlines = [];
        courses.forEach((course) => {
          course.assignments?.forEach((a) => {
            // Only include assignments NOT submitted by this student
            const submitted = a.submissions && a.submissions.some(
              (s) => (s.student?._id || s.student) === user.id
            );
            if (!submitted) {
              allDeadlines.push({
                courseId: course._id,
                assignmentId: a._id,
                courseTitle: course.title,
                assignmentTitle: a.title,
                deadline: new Date(a.deadline),
              });
            }
          });
        });

        const sorted = allDeadlines.sort((a, b) => a.deadline - b.deadline);
        setDeadlines(sorted);
      } catch {
        alert("Failed to fetch deadlines");
      }
    };

    fetchDeadlines();
  }, []);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div>
      <nav style={styles.navbar}>
        {/* "Upcoming Deadlines" text aligned to the left */}
        <h2 style={styles.navbarText}>Upcoming Deadlines</h2>
        {/* Back button on the right */}
        <button onClick={handleBack} style={styles.backButton}>
          <MdArrowBack style={styles.backIcon} /> Back
        </button>
      </nav>
      <div style={styles.container}>
        {deadlines.length === 0 ? (
          <p>No assignments available.</p>
        ) : (
          <ul style={styles.list}>
            {deadlines.map((item, i) => (
              <li
                key={i}
                style={styles.item}
                onClick={() => navigate(`/course/${item.courseId}`)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter') navigate(`/course/${item.courseId}`); }}
              >
                <div style={styles.itemHeader}>
                  <strong style={styles.assignmentTitle}>{item.assignmentTitle}</strong>
                  <em style={styles.courseTitle}>— {item.courseTitle}</em>
                </div>
                <div style={styles.deadlineInfo}>
                  <MdOutlineAccessTime style={styles.blackIcon} />
                  <span>Deadline: {item.deadline.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    backgroundColor: "#202020", 
    padding: "15px 20px",
    color: "#fff",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between", 
    alignItems: "center",
  },
  navbarText: {
    margin: 0,
    color: "white", 
  },
  backButton: {
    background: "light grey", 
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    padding: "10px 15px",
    display: "flex",
    alignItems: "center",
    color: "black", 
    fontSize: "1em",
  },
  backIcon: {
    marginRight: "5px",
    fontSize: "1.2em",
  },
  container: {
    padding: "0 20px",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  item: {
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  itemHeader: {
    marginBottom: "10px",
  },
  assignmentTitle: {
    fontSize: "1.1em",
    color: "#333",
  },
  courseTitle: {
    color: "#666",
    fontSize: "0.9em",
  },
  deadlineInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: "5px",
    color: "#555",
  },
  downloadInfo: {
    display: "flex",
    alignItems: "center",
    color: "#555",
  },
  blackIcon: {
    marginRight: "8px",
    fontSize: "1.2em",
    color: "#000", 
  },
  downloadLink: {
    color: "#000", 
    textDecoration: "none",
    fontWeight: "bold",
  },
};