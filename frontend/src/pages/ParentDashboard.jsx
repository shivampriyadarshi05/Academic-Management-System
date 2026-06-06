// ============================================
// ParentDashboard.jsx — Parent's Dashboard
// ============================================
// Parents can view their child's attendance percentage.
// Shows colour-coded indicator: green if above 75%, red if below.

import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const ParentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // State for all students' attendance data
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentsAttendance();
  }, []);

  const fetchStudentsAttendance = async () => {
    setLoading(true);
    try {
      // Get all students
      const studentsRes = await api.get('/auth/students').catch(() => ({ data: [] }));
      const students = studentsRes.data;

      // Get attendance percentage for each student
      const data = await Promise.all(
        students.map(async (student) => {
          try {
            const pctRes = await api.get(`/attendance/percentage/${student._id}`);
            return { ...student, attendance: pctRes.data };
          } catch {
            return { ...student, attendance: { percentage: 0, totalDays: 0, presentDays: 0, absentDays: 0 } };
          }
        })
      );
      setStudentsData(data);
    } catch (err) {
      setError('Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Parent Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome, {user.name}! 👪</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-red-400">⚠️ {error}</div>
        )}

        {/* Overview */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">📋 Student Attendance Overview</h2>
          <p className="text-text-secondary text-sm mb-6">
            Below is the attendance summary for all registered students.
          </p>

          {studentsData.length === 0 ? (
            <p className="text-text-secondary text-sm">No students registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentsData.map((s) => {
                const pct = s.attendance.percentage;
                const isGood = pct >= 75;
                return (
                  <div
                    key={s._id}
                    className={`p-5 rounded-2xl border ${
                      isGood
                        ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20'
                        : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20'
                    }`}
                  >
                    {/* Student Name & Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isGood ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{s.name}</p>
                          <p className="text-xs text-text-secondary">{s.email}</p>
                        </div>
                      </div>
                      <span className={`text-2xl font-bold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-dark/50 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs text-text-secondary">
                      <span>Total: <strong className="text-text-primary">{s.attendance.totalDays}</strong></span>
                      <span>Present: <strong className="text-emerald-400">{s.attendance.presentDays}</strong></span>
                      <span>Absent: <strong className="text-red-400">{s.attendance.absentDays}</strong></span>
                    </div>

                    {/* Warning if below 75% */}
                    {!isGood && (
                      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                        ⚠️ Attendance below 75% — student may need attention.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
