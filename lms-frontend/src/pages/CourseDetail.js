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
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', type: 'document', file: null });
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

      const data = await response.json();
      setCourse({ ...course, materials: [...course.materials, data] });
      setOpenMaterialModal(false);
      setNewMaterial({ title: '', description: '', type: 'document', file: null });
      setSnackbar({ open: true, message: "Material added successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "danger" });
    }
  };

  const getFileIconClass = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return 'bi-file-earmark-pdf text-danger';
      case 'doc':
      case 'docx': return 'bi-file-earmark-word text-primary';
      case 'ppt':
      case 'pptx': return 'bi-file-earmark-slides text-warning';
      case 'xls':
      case 'xlsx': return 'bi-file-earmark-excel text-success';
      case 'zip':
      case 'rar': return 'bi-file-earmark-zip text-muted';
      case 'mp4':
      case 'mov': return 'bi-file-earmark-play text-info';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'bi-file-earmark-image text-secondary';
      default: return 'bi-file-earmark text-dark';
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100 bg-white text-dark"><div className="spinner-border text-dark" /></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!course) return <div className="alert alert-warning m-3">Course not found</div>;

  return (
    <div className="container py-4">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded shadow-sm mb-4 px-3">
        <span className="navbar-brand fw-bold fs-4">{course.title}</span>
        <div className="ms-auto">
          <button className="btn btn-light" onClick={() => navigate('/teacher-dashboard')}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>
      </nav>
  
      {/* Snackbar */}
      {snackbar.open && (
        <div className={`alert alert-${snackbar.severity} alert-dismissible`} role="alert">
          {snackbar.message}
          <button type="button" className="btn-close" onClick={() => setSnackbar({ ...snackbar, open: false })}></button>
        </div>
      )}
  
      {/* Tabs */}
      <ul className="nav nav-pills bg-light rounded p-2 mb-4 shadow-sm">
        {['home', 'students', 'info'].map(tab => (
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
  
      {/* Home Tab */}
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
                <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer' }}>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-center bg-light rounded mb-3" style={{ height: '150px' }}>
                      <i className={`bi ${getFileIconClass(material?.file?.name || material.title)}`} style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5 className="card-title">{material.title}</h5>
                    <p className="card-text text-muted">{material.description}</p>
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
  
      {/* Students Tab */}
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
  
      {/* Info Tab */}
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


    </div>
  );
}
