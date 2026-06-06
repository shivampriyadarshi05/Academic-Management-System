// ============================================
// Navbar.jsx — Sidebar Navigation Component
// ============================================
// This sidebar appears on all dashboard pages.
// It shows different navigation links based on the user's role.
// It also has a logout button that clears the token and redirects to login.

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get the logged-in user's info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || '';
  const name = user.name || 'User';

  // Handle logout: clear storage and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    switch (role) {
      case 'teacher':
        return [
          { label: '📊 Dashboard', hash: '' },
          { label: '📋 Attendance', hash: '#attendance' },
          { label: '📁 Upload Files', hash: '#upload' },
          { label: '📅 Timetable', hash: '#timetable' },
          { label: '💬 Messages', hash: '#messages' },
          { label: '📄 Reports', hash: '#reports' },
        ];
      case 'student':
        return [
          { label: '📊 Dashboard', hash: '' },
          { label: '📋 Attendance', hash: '#attendance' },
          { label: '📁 Materials', hash: '#materials' },
          { label: '📅 Timetable', hash: '#timetable' },
          { label: '💬 Chat', hash: '#chat' },
        ];
      case 'parent':
        return [
          { label: '📊 Dashboard', hash: '' },
          { label: '📋 Attendance', hash: '#attendance' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Get role color for the badge
  const getRoleColor = () => {
    switch (role) {
      case 'teacher': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'student': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'parent': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-card border border-dark-border text-text-primary hover:bg-primary/20 transition-colors"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border z-40
        flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo / App Name */}
        <div className="p-6 border-b border-dark-border">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📚 AcademiQ
          </h1>
          <p className="text-xs text-text-secondary mt-1">Management System</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor()}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.hash}
              href={item.hash || '#'}
              onClick={() => setIsMobileOpen(false)}
              className={`
                block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                hover:bg-primary/10 hover:text-primary-light hover:translate-x-1
                ${location.hash === item.hash
                  ? 'bg-primary/15 text-primary-light border-l-2 border-primary'
                  : 'text-text-secondary'
                }
              `}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              bg-danger/10 text-red-400 hover:bg-danger/20 transition-all duration-200
              text-sm font-medium border border-danger/20 hover:border-danger/40 cursor-pointer"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
