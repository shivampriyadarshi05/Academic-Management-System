// ============================================
// Login.jsx — Login Page
// ============================================
// Users enter their email and password to log in.
// On success, JWT token and user info are saved to localStorage,
// and the user is redirected to their role-specific dashboard.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    setLoading(true);
    setError('');

    try {
      // Send login request to the backend
      const response = await api.post('/auth/login', { email, password });

      // Save token and user info to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on role
      const role = response.data.user.role;
      if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
      else if (role === 'parent') navigate('/parent');
    } catch (err) {
      // Show user-friendly error message
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📚 AcademiQ
          </h1>
          <p className="text-text-secondary text-sm mt-2">Welcome back! Please sign in.</p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Sign In</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-dark border border-dark-border text-text-primary
                  placeholder-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all duration-200 text-sm"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 rounded-lg bg-dark border border-dark-border text-text-primary
                  placeholder-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all duration-200 text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-medium
                hover:from-primary-dark hover:to-primary transition-all duration-200 text-sm
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Link to Signup */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-light font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
