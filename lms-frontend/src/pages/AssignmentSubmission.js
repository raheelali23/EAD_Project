// pages/AssignmentSubmission.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import { getRemainingTime } from '../utils/timeUtils';

export default function AssignmentSubmission() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignmentDetails();
  }, []);

  const fetchAssignmentDetails = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`);
      const data = await res.json();
      if (res.ok) {
        const target = data.assignments.find(a => a._id === assignmentId);
        setAssignment(target);
        const studentSubmission = target.submissions.find(s => s.student === data.loggedInStudentId); // Assuming backend sends student ID
        if (studentSubmission) {
          setSubmission(studentSubmission);
        }
      } else {
        setMessage('Failed to load assignment details');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error fetching assignment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/submissions/${assignmentId}`, {
        method: submission ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Submission successful.");
        fetchAssignmentDetails();
      } else {
        setMessage(data.message || "Error submitting assignment.");
      }
    } catch (err) {
      setMessage("Submission failed.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure to delete your submission?")) return;

    try {
      const res = await fetch(`${API_BASE}/submissions/${submission._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSubmission(null);
        setMessage("Submission deleted.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete submission.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Submit Assignment</h3>
      {assignment && (
        <>
          <p><strong>Title:</strong> {assignment.title}</p>
          <p><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}</p>
          <p><strong>Status:</strong> {getRemainingTime(assignment.deadline)}</p>
        </>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="file" className="form-label">Select File</label>
          <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button type="submit" className="btn btn-primary">{submission ? "Update Submission" : "Submit Assignment"}</button>
        {submission && (
          <button type="button" className="btn btn-danger ms-2" onClick={handleDelete}>Delete Submission</button>
        )}
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}
