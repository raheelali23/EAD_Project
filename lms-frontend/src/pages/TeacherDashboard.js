import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', enrollmentKey: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // ✅ Assign persistent image per course
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
    if (!token || !user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'teacher') {
      navigate('/student-dashboard');
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (token && user?.role === 'teacher') {
      fetchCourses();
    }
  }, [token, user?.id]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      const teacherCourses = data.filter(course => course.teacher?._id === user.id);
      setCourses(teacherCourses);
      setFilteredCourses(teacherCourses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.enrollmentKey) {
      setSnackbar({ open: true, message: 'Title and enrollment key are required', severity: 'danger' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newCourse, teacherId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }

      const data = await response.json();
      setCourses([...courses, data]);
      setFilteredCourses([...courses, data]);
      setShowModal(false);
      setNewCourse({ title: '', description: '', enrollmentKey: '' });
      setSnackbar({ open: true, message: 'Course created successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'danger' });
    }
  };

  const handleDeleteClick = (course, event) => {
    event.stopPropagation();
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE}/courses/${courseToDelete._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete course');
      }

      const updatedCourses = courses.filter(c => c._id !== courseToDelete._id);
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      setSnackbar({ open: true, message: 'Course deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'danger' });
    } finally {
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container py-4">
      {snackbar.open && (
        <div className={`alert alert-${snackbar.severity} alert-dismissible`} role="alert">
          {snackbar.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          ></button>
        </div>
      )}

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded shadow-sm mb-4 px-3">
        <span className="navbar-brand fw-bold fs-4">Welcome, {user?.name}</span>
        <div className="collapse navbar-collapse">
          <div className="d-flex justify-content-between w-100">
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control me-2 mb-3 mb-lg-0"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-light" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-circle me-1"></i> Create Course
              </button>
              <button className="btn btn-light" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="row">
        {filteredCourses.map(course => (
          <div key={course._id} className="col-md-4 mb-4">
            <div
              className="card h-100"
              onClick={() => navigate(`/teacher-dashboard/course/${course._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={getPersistentImage(course._id)}
                className="card-img-top"
                alt="Course"
                style={{ height: '180px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h5 className="card-title">{course.title}</h5>
                  <button className="btn btn-sm btn-outline-danger" onClick={(e) => handleDeleteClick(course, e)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                <p className="card-text">{course.description}</p>
                <div className="d-flex justify-content-between mt-3">
                  <span><i className="bi bi-people"></i> {course.enrolledStudents?.length || 0} students</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="modal d-block show" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Course</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Course Title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
                <textarea
                  className="form-control mb-2"
                  placeholder="Description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enrollment Key"
                  value={newCourse.enrollmentKey}
                  onChange={(e) => setNewCourse({ ...newCourse, enrollmentKey: e.target.value })}
                />
                <small className="text-muted">This key will be used by students to enroll in the course</small>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateCourse}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal d-block show" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Course</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteConfirmOpen(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete the course "{courseToDelete?.title}"?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
