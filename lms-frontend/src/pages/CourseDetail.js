import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState('home');
  const [openMaterialModal, setOpenMaterialModal] = useState(false);
  const [openAssignmentModal, setOpenAssignmentModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', type: 'document', file: null });
  const [newAssignment, setNewAssignment] = useState({ title: '', deadline: '', file: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch course details');
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, token]);

  const handleAddMaterial = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newMaterial.title);
      formData.append("description", newMaterial.description);
      formData.append("type", newMaterial.type);
      if (newMaterial.file) formData.append("file", newMaterial.file);
  
      const response = await fetch(`${API_BASE}/courses/${id}/materials`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add material");
      }
  
      const updatedCourse = await response.json();
      setCourse(updatedCourse);
      setOpenMaterialModal(false);
      setNewMaterial({ title: '', description: '', type: 'document', file: null });
      setSnackbar({ open: true, message: "Material added successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "danger" });
    }
  };
  
  const handleDeleteMaterial = async (materialId) => {
    try {
      const res = await fetch(`${API_BASE}/courses/${course._id}/materials/${materialId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete material");
      }
  
      setCourse((prev) => ({
        ...prev,
        materials: prev.materials.filter((m) => m._id !== materialId),
      }));
  
      setSnackbar({ open: true, message: "Material deleted successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "danger" });
    }
  };
   

  const handleAddAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newAssignment.title);
      formData.append("deadline", newAssignment.deadline);
      if (newAssignment.file) {
        formData.append("file", newAssignment.file);
      }

      const response = await fetch(`${API_BASE}/courses/${id}/assignments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add assignment");
      }

      setCourse(prevCourse => ({
        ...prevCourse,
        assignments: [...(prevCourse.assignments || []), responseData]
      }));
      setOpenAssignmentModal(false);
      setNewAssignment({ title: '', deadline: '', file: null });
      setSnackbar({ open: true, message: "Assignment added successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to add assignment. Please try again.", 
        severity: "danger" 
      });
    }
  };

  const getFileExtension = (filename) => {
    return filename ? filename.split('.').pop() : '';
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff <= 0) {
      return { status: 'overdue', text: 'Overdue' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { status: 'active', text: `${days} day${days > 1 ? 's' : ''} remaining` };
    } else if (hours > 0) {
      return { status: 'urgent', text: `${hours} hour${hours > 1 ? 's' : ''} remaining` };
    } else {
      return { status: 'urgent', text: `${minutes} minute${minutes > 1 ? 's' : ''} remaining` };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'danger';
      case 'urgent':
        return 'warning';
      case 'active':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100 bg-white text-dark"><div className="spinner-border text-dark" /></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!course) return <div className="alert alert-warning m-3">Course not found</div>;

  return (
    <div className="container py-4">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded shadow-sm mb-4 px-3">
        <span className="navbar-brand fw-bold fs-4">{course.title}</span>
        <div className="ms-auto">
          <button className="btn btn-light" onClick={() => navigate('/teacher-dashboard')}>
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
  
      <ul className="nav nav-pills bg-light rounded p-2 mb-4 shadow-sm">
        {['home', 'assignments', 'students', 'info'].map(tab => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${tabValue === tab ? 'active bg-dark text-white' : 'text-dark'}`}
              onClick={() => setTabValue(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {tabValue === 'home' && (
  <div>
    <div className="d-flex justify-content-end mb-3">
      <button className="btn btn-light shadow-sm" onClick={() => setOpenMaterialModal(true)}>
        <i className="bi bi-plus-circle me-1"></i> Add Material
      </button>
    </div>

    <div className="row">
      {course.materials?.length > 0 ? course.materials.map((material, idx) => (
        <div className="col-md-4 mb-4" key={idx}>
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column">
              <div className="d-flex align-items-center justify-content-center bg-light rounded mb-3" style={{ height: '150px' }}>
                <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title">{material.title}</h5>
              <p className="card-text text-muted">{material.description}</p>

              <div className="d-flex justify-content-between mt-auto">
                <a
                  href={`http://localhost:5000/api/uploads/${material.filePath?.split('/').pop()}`}
                  download
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-download me-1"></i> Download
                </a>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDeleteMaterial(material._id)}
                >
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )) : (
        <div className="col-12">
          <div className="alert alert-info">No materials uploaded yet</div>
        </div>
      )}
    </div>
  </div>
)}


      {tabValue === 'assignments' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Course Assignments</h4>
            <button className="btn btn-primary shadow-sm" onClick={() => setOpenAssignmentModal(true)}>
              <i className="bi bi-plus-circle me-1"></i> Add Assignment
            </button>
          </div>

          <div className="row">
            {course.assignments?.length > 0 ? course.assignments.map((assignment, idx) => {
              const timeRemaining = getTimeRemaining(assignment.deadline);
              const statusColor = getStatusColor(timeRemaining.status);
              
              return (
                <div className="col-md-4 mb-4" key={idx}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex align-items-center justify-content-center bg-light rounded mb-3" style={{ height: '150px' }}>
                        <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{assignment.title}</h5>
                        <span className={`badge bg-${statusColor} text-white`}>
                          {timeRemaining.text}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="card-text text-muted mb-1">
                          <i className="bi bi-calendar-event me-1"></i>
                          Deadline: {new Date(assignment.deadline).toLocaleString()}
                        </p>
                        {assignment.submissions?.length > 0 && (
                          <p className="card-text text-muted mb-0">
                            <i className="bi bi-people me-1"></i>
                            {assignment.submissions.length} submission{assignment.submissions.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      {assignment.fileUrl && (
                        <button 
                          onClick={async () => {
                            try {
                              const downloadUrl = `${API_BASE}/courses/${id}/assignments/${assignment._id}/download`;
                              const response = await fetch(downloadUrl, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to download file');
                              }

                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              const extension = getFileExtension(assignment.fileUrl);
                              link.download = `${assignment.title}.${extension}`;
                              
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              setSnackbar({
                                open: true,
                                message: 'Failed to download file. Please try again.',
                                severity: 'danger'
                              });
                            }
                          }}
                          className="btn btn-outline-primary mt-auto"
                        >
                          <i className="bi bi-download me-1"></i> Download Assignment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-12">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No assignments added yet
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tabValue === 'students' && (
        <div className="list-group">
          {course.enrolledStudents?.length > 0 ? course.enrolledStudents.map((student) => (
            <div key={student._id} className="list-group-item bg-light text-dark border-0 shadow-sm mb-2 rounded">
              <strong>{student.name}</strong> - {student.email}
            </div>
          )) : (
            <div className="alert alert-info">No students enrolled yet</div>
          )}
        </div>
      )}

      {tabValue === 'info' && (
        <div className="bg-light p-4 rounded shadow-sm">
          <h5>Description</h5>
          <p>{course.description || 'No description provided.'}</p>
          <p className="mb-1"><strong>Teacher:</strong> {course.teacher?.name || 'Unknown'}</p>
          <p className="mb-0"><strong>Students Enrolled:</strong> {course.enrolledStudents?.length || 0}</p>
          <h6 className="mt-3 text-muted">Enrollment Key: <code>{course.enrollmentKey}</code></h6>
        </div>
      )}

      {openMaterialModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target.classList.contains('modal')) {
              setOpenMaterialModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title">Upload Course Material</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setOpenMaterialModal(false)}></button>
              </div>
              <div className="modal-body bg-light rounded-bottom-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddMaterial();
                }}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Title</label>
                    <input type="text" className="form-control rounded-3 shadow-sm"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea className="form-control rounded-3 shadow-sm" rows="3"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Upload File</label>
                    <input type="file" className="form-control rounded-3 shadow-sm"
                      onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })} />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-dark me-2">
                      <i className="bi bi-cloud-upload me-1"></i> Upload
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setOpenMaterialModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {openAssignmentModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target.classList.contains('modal')) {
              setOpenAssignmentModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title">Add New Assignment</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setOpenAssignmentModal(false)}></button>
              </div>
              <div className="modal-body bg-light rounded-bottom-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddAssignment();
                }}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Assignment Title</label>
                    <input type="text" className="form-control rounded-3 shadow-sm"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Deadline</label>
                    <input type="datetime-local" className="form-control rounded-3 shadow-sm"
                      value={newAssignment.deadline}
                      onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                      required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Assignment File (PDF/DOC)</label>
                    <input type="file" className="form-control rounded-3 shadow-sm"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                      required />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-dark me-2">
                      <i className="bi bi-cloud-upload me-1"></i> Upload Assignment
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setOpenAssignmentModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
