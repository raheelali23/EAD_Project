import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../config';


export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      navigate(user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', maxWidth: '900px', width: '100%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        {/* Left Side - Image and Black Background */}
        {/* <div style={{ flex: 1, backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <img src={loginImage} alt="Login Illustration" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
        </div> */}
<div style={{ flex: 1, backgroundColor: 'black', overflow: 'hidden' }}>
  <img src={`/images/courses/login.jpg`} alt="Login Illustration" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</div>

        {/* Right Side - Login Form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px',backgroundColor: '#f8f9fa' }}>
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            
            <h2 className="fw-bold" style={{ marginBottom: '1.5rem' }}>Welcome!</h2>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Username"
                value={formData.email}
                onChange={handleChange}
                className="form-control border-0 border-bottom rounded-0"
                required
                style={{ outline: 'none', padding: '0.5rem 0' }}
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="form-control border-0 border-bottom rounded-0"
                required
                style={{ outline: 'none', padding: '0.5rem 0' }}
              />
            </div>

            <div className="mb-3">
              <select
                className="form-select border-0 border-bottom rounded-0"
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ outline: 'none', padding: '0.5rem 0' }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
  
              <button
                type="submit"
                className="btn text-white rounded-pill"
                style={{
                  backgroundColor: 'black',
                  padding: '0.7rem 1.5rem',
                  fontWeight: 'bold',
                  width: '100%',
                  marginBottom: '1rem'
                }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
  
  <div className="text-left mt-3">
            <p className="mb-1 text-muted">Don’t have an account?</p>
            <Link to="/register">
              <button
                className="btn rounded-pill text-white"
                style={{
                  backgroundColor: 'black', 
                  padding: '0.6rem 1.2rem',
                  fontWeight: 'bold'
                }}
              >
                Create
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
  