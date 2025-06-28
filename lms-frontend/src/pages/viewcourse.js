import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function ViewCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, assignmentId: null });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id || user?._id;

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

  const handleSubmitAssignment = async (assignmentTitle) => {
    try {
      if (!submissionFile) {
        return setSnackbar({ open: true, message: "Please select a file", severity: "danger" });
      }

      const formData = new FormData();
      formData.append("file", submissionFile);

      const response = await fetch(`${API_BASE}/courses/${id}/assignments/${assignmentTitle}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = contentType?.includes("application/json")
          ? (await response.json()).message
          : await response.text();
        throw new Error(errorText || "Submission failed.");
      }

      // Check if submission is late
      const assignment = course.assignments.find(a => a._id === assignmentTitle);
      const isLate = assignment && new Date() > new Date(assignment.deadline);
      
      const message = isLate 
        ? "Assignment submitted successfully! (Late submission)" 
        : "Assignment submitted successfully!";
      
      const severity = isLate ? "warning" : "success";
      
      setSnackbar({ open: true, message, severity });
      setSubmissionFile(null);
      setSubmittingAssignmentId(null);

      // Refresh course data
      const updatedRes = await fetch(`${API_BASE}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setCourse(updatedData);

    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "danger" });
    }
  };

  const handleDeleteSubmission = async (assignmentId) => {
    try {
      const response = await fetch(`${API_BASE}/courses/${id}/assignments/${assignmentId}/submit`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete submission.');
      }
      setSnackbar({ open: true, message: 'Submission deleted successfully!', severity: 'success' });
      // Refresh course data
      const updatedRes = await fetch(`${API_BASE}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setCourse(updatedData);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'danger' });
    }
  };

  const handleDownloadSubmission = async (assignmentId, submissionId) => {
    try {
      const response = await fetch(`${API_BASE}/courses/${id}/assignments/${assignmentId}/submissions/${submissionId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download submission');
      }
      
      // Get the filename from the response headers or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'submission';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'danger' });
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    if (diff <= 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days} day(s)` : `${hours} hour(s)`;
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!course) return <div className="spinner-border text-dark" />;

  const getTabStyle = (tabName) =>
    activeTab === tabName
      ? { ...styles.navLink, fontWeight: "bold", backgroundColor: "#343a40", color: "white" }
      : { ...styles.navLink, color: "#6c757d" };

  return (
    <div className="container py-4">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded shadow-sm mb-4 px-3">
        <span className="navbar-brand fw-bold fs-4">{course.title}</span>
        <div className="ms-auto">
          <button className="btn btn-light" onClick={() => window.history.back()}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>
      </nav>

      {snackbar.open && (
        <div className={`alert alert-${snackbar.severity} alert-dismissible`} role="alert">
          {snackbar.message}
          <button type="button" className="btn-close" onClick={() => setSnackbar({ ...snackbar, open: false })}></button>
        </div>
      )}

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

      {/* HOME TAB */}
      {activeTab === "home" && (
        <div>
          <h3>Materials</h3>
          {course.materials?.length > 0 ? (
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
                          href={`http://localhost:5000/uploads/${m.filePath.split("/").pop()}`}
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
          ) : <p>No materials available.</p>}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === "assignments" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Assignments</h3>
            <div className="badge bg-primary fs-6">
              {course.assignments?.length || 0} Assignment{course.assignments?.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {course.assignments?.length > 0 ? (
            <div className="row">
              {course.assignments.map((a, i) => {
                const submission = a.submissions?.find(s => (s.student?._id || s.student) === studentId);
                const isLate = submission && new Date(submission.submittedAt) > new Date(a.deadline);
                const timeRemaining = getTimeRemaining(a.deadline);
                const isOverdue = timeRemaining === "Overdue";
                const submittedText = submission
                  ? (isLate
                      ? `Late submission (${getTimeRemaining(new Date(submission.submittedAt) - new Date(a.deadline))})`
                      : `Submitted on time`)
                  : null;
                
                return (
                  <div key={i} className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-header bg-light border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{a.title}</h6>
                          <span className={`badge bg-${isOverdue ? 'danger' : timeRemaining.includes('hour') ? 'warning' : 'success'} small`}>
                            {timeRemaining}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                          <small className="text-muted">
                            <strong>Deadline:</strong> {new Date(a.deadline).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        
                        {a.fileUrl && (
                          <div className="mb-2">
                            <a
                              href={`http://localhost:5000/uploads/${a.fileUrl.split("/").pop()}`}
                              download
                              className="btn btn-outline-primary btn-sm"
                            >
                              Download Assignment
                            </a>
                          </div>
                        )}

                        {submission ? (
                          <div className="mt-auto">
                            <div className={`alert alert-${isLate ? 'warning' : 'success'} border-0 small mb-2`}>
                              <strong>{submittedText}</strong>
                              <br />
                              <small className="text-muted">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </small>
                            </div>
                            
                            {submission.submissionUrl && (
                              <button
                                onClick={() => handleDownloadSubmission(a._id, submission._id)}
                                className="btn btn-primary btn-sm w-100 mb-2"
                              >
                                Download Your Submission
                              </button>
                            )}
                            
                            <div className="d-grid gap-1">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  setSubmissionFile(e.target.files[0]);
                                  setSubmittingAssignmentId(a._id);
                                }}
                                className="form-control form-control-sm"
                              />
                              {submittingAssignmentId === a._id && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleSubmitAssignment(a._id)}
                                >
                                  Resubmit
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => setConfirmDelete({ open: true, assignmentId: a._id })}
                              >
                                Delete Submission
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-auto">
                            <div className="alert alert-info border-0 small mb-2">
                              {isOverdue ? (
                                <strong>Overdue - You can still submit</strong>
                              ) : (
                                "Not submitted yet"
                              )}
                            </div>
                            
                            <div className="d-grid gap-1">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  setSubmissionFile(e.target.files[0]);
                                  setSubmittingAssignmentId(a._id);
                                }}
                                className="form-control form-control-sm"
                              />
                              {submittingAssignmentId === a._id && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleSubmitAssignment(a._id)}
                                >
                                  Submit Assignment
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <h4 className="text-muted">No assignments available</h4>
              <p className="text-muted">Check back later for new assignments.</p>
            </div>
          )}
           
          {/* Confirmation Modal */}
          {confirmDelete.open && confirmDelete.assignmentId && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                  <div className="modal-header bg-danger text-white rounded-top-4">
                    <h5 className="modal-title">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Confirm Delete
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmDelete({ open: false, assignmentId: null })}></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to delete your submission for <strong>{course.assignments?.find(a => a._id === confirmDelete.assignmentId)?.title}</strong>?</p>
                    <p className="text-muted small">This action cannot be undone.</p>
                    <div className="d-flex justify-content-end mt-3 gap-2">
                      <button className="btn btn-secondary" onClick={() => setConfirmDelete({ open: false, assignmentId: null })}>
                        <i className="bi bi-x-circle me-1"></i>
                        Cancel
                      </button>
                      <button className="btn btn-danger" onClick={() => { 
                        handleDeleteSubmission(confirmDelete.assignmentId); 
                        setConfirmDelete({ open: false, assignmentId: null }); 
                      }}>
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PARTICIPANTS TAB */}
      {activeTab === "participants" && (
        <div>
          <h3>Participants</h3>
          {course.enrolledStudents?.length > 0 ? (
            <div className="row">
              {course.enrolledStudents.map((student) => (
                <div className="col-md-4 mb-3" key={student._id}>
                  <div className="card h-100 border-1 shadow-sm">
                    <div className="card-body d-flex align-items-center">
                      <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
                        style={{ width: "50px", height: "50px", fontSize: "20px" }}>
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
          ) : <p className="text-muted">No students enrolled in this course.</p>}
        </div>
      )}

      {/* INFO TAB */}
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
                  </a>
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
  navLink: {
    textDecoration: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    color: "#6c757d",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};
