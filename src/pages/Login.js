import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../utils/api';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAPI(formData);
      login(response.data.user, response.data.token);
      alert('✅ Login successful!');
      navigate('/boards');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">Vision Board</h1>
          <p className="auth-tagline">Welcome back! ✨</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-title">Log In</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>

        <div className="auth-decoration star-1">⭐</div>
        <div className="auth-decoration star-2">⭐</div>
        <div className="auth-decoration heart-1">❤️</div>
      </div>
    </div>
  );
}

export default Login;