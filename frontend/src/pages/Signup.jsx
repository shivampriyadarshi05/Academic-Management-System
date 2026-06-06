// ============================================
// Signup.jsx — Registration Page
// ============================================
// New users enter name, email, password, and select their role.
// On success, they are automatically logged in and redirected.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!role) {
      setError('Please select a role.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/signup', { name, email, password, role });

      // Auto-login: save token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on role
      if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
      else if (role === 'parent') navigate('/parent');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Role options with icons and colors
  const roles = [
    { value: 'teacher', label: 'Teacher', icon: '👨‍🏫', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/40 text-indigo-300' },
    { value: 'student', label: 'Student', icon: '🎓', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-300' },
    { value: 'parent', label: 'Parent', icon: '👪', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📚 AcademiQ
          </h1>
          <p className="text-text-secondary text-sm mt-2">Create your account to get started</p>
        </div>

        {/* Signup Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-lg bg-dark border border-dark-border text-text-primary
                  placeholder-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-dark border border-dark-border text-text-primary
                  placeholder-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 rounded-lg bg-dark border border-dark-border text-text-primary
                  placeholder-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all text-sm"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value} type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer
                      ${role === r.value
                        ? `bg-gradient-to-b ${r.color} scale-105`
                        : 'bg-dark border-dark-border text-text-secondary hover:border-dark-border/80'
                      }`}
                  >
                    <span className="text-2xl block mb-1">{r.icon}</span>
                    <span className="text-xs font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-medium
                hover:from-primary-dark hover:to-primary transition-all text-sm cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
