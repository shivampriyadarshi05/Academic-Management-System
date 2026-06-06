// ============================================
// PrivateRoute.jsx — Route Protection Component
// ============================================
// This component wraps around protected pages (dashboards).
// If the user is NOT logged in (no token), it redirects to /login.
// If the user IS logged in, it renders the child component.
//
// Usage in App.jsx:
//   <Route path="/teacher" element={<PrivateRoute><TeacherDashboard /></PrivateRoute>} />

import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if a JWT token exists in localStorage
  const token = localStorage.getItem('token');

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected page
  return children;
};

export default PrivateRoute;
