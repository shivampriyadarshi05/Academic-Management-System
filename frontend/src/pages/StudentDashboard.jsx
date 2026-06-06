// ============================================
// StudentDashboard.jsx — Student's Main Dashboard
// ============================================
// Shows: Attendance %, Materials, Timetable, ChatBox (if absent today)

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import TimetableGrid from '../components/TimetableGrid';

const StudentDashboard = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const section = location.hash.replace('#', '') || 'dashboard';

  // State
  const [attendanceData, setAttendanceData] = useState({ totalDays: 0, presentDays: 0, absentDays: 0, percentage: 100 });
  const [isAbsentToday, setIsAbsentToday] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [percentRes, statusRes, matRes, ttRes] = await Promise.all([
        api.get(`/attendance/percentage/${user.id}`),
        api.get(`/attendance/status/${user.id}/${today}`),
        api.get('/upload'),
        api.get('/timetable'),
      ]);
      setAttendanceData(percentRes.data);
      setIsAbsentToday(statusRes.data.isAbsent);
      setMaterials(matRes.data);
      setTimetableEntries(ttRes.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
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

  const pctColor = attendanceData.percentage >= 75 ? 'text-emerald-400' : 'text-red-400';
  const pctBg = attendanceData.percentage >= 75 ? 'from-emerald-500/20 to-emerald-600/10' : 'from-red-500/20 to-red-600/10';

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Student Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome, {user.name}! 🎓</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-red-400">⚠️ {error}</div>
        )}

        {/* Low Attendance Warning Banner */}
        {attendanceData.percentage < 75 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-pulse">
            <span className="text-3xl">🚨</span>
            <div>
              <p className="text-sm font-semibold text-red-400">Low Attendance Warning!</p>
              <p className="text-xs text-text-secondary">
                Your attendance is {attendanceData.percentage}% — below the required 75%. Please attend classes regularly.
              </p>
            </div>
          </div>
        )}

        {/* ==================== DASHBOARD OVERVIEW ==================== */}
        {(section === 'dashboard' || section === 'attendance') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Attendance Percentage Card */}
            <div className={`bg-gradient-to-br ${pctBg} rounded-2xl border border-dark-border p-5`}>
              <p className="text-xs text-text-secondary mb-1">Attendance</p>
              <p className={`text-3xl font-bold ${pctColor}`}>{attendanceData.percentage}%</p>
              <div className="w-full bg-dark/50 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${attendanceData.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(attendanceData.percentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-2xl border border-dark-border p-5">
              <p className="text-xs text-text-secondary mb-1">Total Days</p>
              <p className="text-3xl font-bold text-text-primary">{attendanceData.totalDays}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl border border-dark-border p-5">
              <p className="text-xs text-text-secondary mb-1">Days Present</p>
              <p className="text-3xl font-bold text-emerald-400">{attendanceData.presentDays}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl border border-dark-border p-5">
              <p className="text-xs text-text-secondary mb-1">Days Absent</p>
              <p className="text-3xl font-bold text-red-400">{attendanceData.absentDays}</p>
            </div>
          </div>
        )}

        {/* ==================== MATERIALS SECTION ==================== */}
        {(section === 'dashboard' || section === 'materials') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📁 Study Materials</h2>
            {materials.length === 0 ? (
              <p className="text-text-secondary text-sm">No materials uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {materials.map((m) => (
                  <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-dark/50 border border-dark-border/50">
                    <div>
                      <p className="text-sm text-text-primary">{m.fileName}</p>
                      <p className="text-xs text-text-secondary">
                        {m.category} · {new Date(m.uploadDate).toLocaleDateString()}
                        {m.uploadedBy && ` · by ${m.uploadedBy.name}`}
                      </p>
                    </div>
                    <a href={`http://localhost:5000/${m.filePath}`} target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-secondary/10 text-sky-400 text-xs font-medium hover:bg-secondary/20 transition-colors">
                      ⬇ Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TIMETABLE SECTION ==================== */}
        {(section === 'dashboard' || section === 'timetable') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📅 Weekly Timetable</h2>
            <TimetableGrid entries={timetableEntries} />
          </div>
        )}

        {/* ==================== CHATBOX (only if absent today) ==================== */}
        {(section === 'dashboard' || section === 'chat') && isAbsentToday && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">💬 Chat with Teacher</h2>
            <p className="text-xs text-text-secondary mb-3">
              You are marked absent today. Use this chat to communicate with your teacher.
            </p>
            <ChatBox studentId={user.id} receiverId="teacher" />
          </div>
        )}

        {(section === 'chat') && !isAbsentToday && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-text-primary font-medium">You are marked present today!</p>
            <p className="text-text-secondary text-sm mt-1">Chat is available only when you are absent.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
