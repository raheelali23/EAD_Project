import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

export default function StudentDeadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

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
            allDeadlines.push({
              courseTitle: course.title,
              assignmentTitle: a.title,
              deadline: new Date(a.deadline),
              fileUrl: a.fileUrl,
            });
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Upcoming Deadlines</h2>
      {deadlines.length === 0 ? (
        <p>No assignments available.</p>
      ) : (
        <ul>
          {deadlines.map((item, i) => (
            <li key={i} style={styles.item}>
              <strong>{item.assignmentTitle}</strong> — <em>{item.courseTitle}</em><br />
              Deadline: {item.deadline.toLocaleString()}<br />
              File: <a href={item.fileUrl} target="_blank" rel="noreferrer">Download</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  item: {
    marginBottom: "20px",
    padding: "10px",
    borderBottom: "1px solid #ccc"
  }
};
