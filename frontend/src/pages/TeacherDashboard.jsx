// ============================================
// TeacherDashboard.jsx — Teacher's Main Dashboard
// ============================================
// Contains 5 sections: Attendance, File Upload, Timetable, Messages, Reports
// Uses hash-based section navigation (#attendance, #upload, etc.)

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import TimetableGrid from '../components/TimetableGrid';

const TeacherDashboard = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ---- STATE ----
  // Attendance
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'present'|'absent' }
  const [attendanceSummary, setAttendanceSummary] = useState({ total: 0, present: 0, absent: 0 });

  // File Upload
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [materials, setMaterials] = useState([]);

  // Timetable
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [ttDay, setTtDay] = useState('Monday');
  const [ttTimeSlot, setTtTimeSlot] = useState('');
  const [ttSubject, setTtSubject] = useState('');
  const [ttClassroom, setTtClassroom] = useState('');
  const [ttSemester, setTtSemester] = useState('');

  // Messages
  const [conversations, setConversations] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [studentMessages, setStudentMessages] = useState({});

  // General
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Determine which section to show based on URL hash
  const section = location.hash.replace('#', '') || 'dashboard';

  // ---- FETCH DATA ON MOUNT ----
  useEffect(() => {
    fetchData();
  }, []);

  // Re-fetch attendance when date changes
  useEffect(() => {
    fetchAttendanceForDate();
  }, [attendanceDate, students]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, materialsRes, timetableRes, convoRes] = await Promise.all([
        api.get('/auth/students').catch(() => ({ data: [] })),
        api.get('/upload'),
        api.get('/timetable'),
        api.get('/messages/conversations/teacher').catch(() => ({ data: [] })),
      ]);
      setStudents(studentsRes.data);
      setMaterials(materialsRes.data);
      setTimetableEntries(timetableRes.data);
      setConversations(convoRes.data);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async () => {
    if (!attendanceDate) return;
    try {
      const res = await api.get(`/attendance/${attendanceDate}`);
      const map = {};
      let present = 0, absent = 0;
      res.data.forEach((rec) => {
        map[rec.studentId] = rec.status;
        if (rec.status === 'present') present++;
        else absent++;
      });
      setAttendanceMap(map);
      setAttendanceSummary({ total: students.length, present, absent });
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  // ---- MARK ATTENDANCE ----
  const markAttendance = async (studentId, studentName, status) => {
    try {
      setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
      await api.post('/attendance/mark', { studentId, studentName, date: attendanceDate, status });
      setSuccess(`${studentName} marked ${status}`);
      fetchAttendanceForDate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark attendance.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ---- FILE UPLOAD ----
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !category) { setError('File and category required.'); return; }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    try {
      await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('File uploaded!');
      setFile(null);
      setCategory('');
      const res = await api.get('/upload');
      setMaterials(res.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ---- ADD TIMETABLE ENTRY ----
  const handleAddTimetable = async (e) => {
    e.preventDefault();
    if (!ttDay || !ttTimeSlot || !ttSubject || !ttClassroom || !ttSemester) {
      setError('All timetable fields required.'); return;
    }
    try {
      await api.post('/timetable', { day: ttDay, timeSlot: ttTimeSlot, subject: ttSubject, classroom: ttClassroom, semester: ttSemester });
      setSuccess('Timetable entry added!');
      setTtTimeSlot(''); setTtSubject(''); setTtClassroom(''); setTtSemester('');
      const res = await api.get('/timetable');
      setTimetableEntries(res.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add timetable entry.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ---- DELETE TIMETABLE ENTRY ----
  const handleDeleteTimetable = async (id) => {
    try {
      await api.delete(`/timetable/${id}`);
      setTimetableEntries((prev) => prev.filter((e) => e._id !== id));
      setSuccess('Entry deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete entry.');
    }
  };

  // ---- SEND REPLY MESSAGE ----
  const handleReply = async (studentId) => {
    const text = replyTexts[studentId];
    if (!text?.trim()) return;
    try {
      await api.post('/messages', { receiverId: studentId, text: text.trim() });
      setReplyTexts((prev) => ({ ...prev, [studentId]: '' }));
      setSuccess('Reply sent!');
      // Refresh messages for this student
      const res = await api.get(`/messages/${studentId}`);
      setStudentMessages((prev) => ({ ...prev, [studentId]: res.data }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send reply.');
    }
  };

  // Load messages for a specific student
  const loadStudentMessages = async (studentId) => {
    try {
      const res = await api.get(`/messages/${studentId}`);
      setStudentMessages((prev) => ({ ...prev, [studentId]: res.data }));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // ---- LOADING STATE ----
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

      {/* Main Content — pushed right to accommodate sidebar on desktop */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Teacher Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back, {user.name}! 👋</p>
        </div>

        {/* Toast Messages */}
        {success && (
          <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-emerald-400 animate-pulse">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* ==================== DASHBOARD OVERVIEW ==================== */}
        {section === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="🎓" label="Students" value={students.length} color="from-indigo-500/20 to-indigo-600/10" />
            <StatCard icon="📁" label="Materials" value={materials.length} color="from-emerald-500/20 to-emerald-600/10" />
            <StatCard icon="📅" label="Timetable Entries" value={timetableEntries.length} color="from-amber-500/20 to-amber-600/10" />
            <StatCard icon="💬" label="Conversations" value={conversations.length} color="from-sky-500/20 to-sky-600/10" />
          </div>
        )}

        {/* ==================== ATTENDANCE SECTION ==================== */}
        {(section === 'dashboard' || section === 'attendance') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📋 Mark Attendance</h2>

            {/* Date Picker & Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Select Date</label>
                <input
                  type="date" value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm
                    focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-dark border border-dark-border text-xs text-text-secondary">
                  Total: <strong className="text-text-primary">{students.length}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/30 text-xs text-emerald-400">
                  Present: <strong>{attendanceSummary.present}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-red-400">
                  Absent: <strong>{attendanceSummary.absent}</strong>
                </span>
              </div>
            </div>

            {/* Student List */}
            {students.length === 0 ? (
              <p className="text-text-secondary text-sm">No students registered yet.</p>
            ) : (
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-dark/50 border border-dark-border/50 hover:border-dark-border transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold text-primary-light">
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-sm text-text-primary">{s.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAttendance(s._id, s.name, 'present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                          ${attendanceMap[s._id] === 'present'
                            ? 'bg-success text-white shadow-lg shadow-success/30'
                            : 'bg-success/10 text-emerald-400 border border-success/30 hover:bg-success/20'
                          }`}
                      >
                        ✓ Present
                      </button>
                      <button
                        onClick={() => markAttendance(s._id, s.name, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                          ${attendanceMap[s._id] === 'absent'
                            ? 'bg-danger text-white shadow-lg shadow-danger/30'
                            : 'bg-danger/10 text-red-400 border border-danger/30 hover:bg-danger/20'
                          }`}
                      >
                        ✗ Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== FILE UPLOAD SECTION ==================== */}
        {(section === 'dashboard' || section === 'upload') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📁 Upload Material</h2>
            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="file" onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                className="flex-1 text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg
                  file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary-light
                  file:cursor-pointer hover:file:bg-primary/20"
              />
              <select
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select Category</option>
                <option value="Lesson Plan">Lesson Plan</option>
                <option value="Study Material">Study Material</option>
                <option value="Assignment">Assignment</option>
              </select>
              <button type="submit"
                className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors cursor-pointer">
                Upload
              </button>
            </form>

            {/* Materials List */}
            <div className="space-y-2">
              {materials.map((m) => (
                <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-dark/50 border border-dark-border/50">
                  <div>
                    <p className="text-sm text-text-primary">{m.fileName}</p>
                    <p className="text-xs text-text-secondary">{m.category} · {new Date(m.uploadDate).toLocaleDateString()}</p>
                  </div>
                  <a href={`http://localhost:5000/${m.filePath}`} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-secondary/10 text-sky-400 text-xs font-medium hover:bg-secondary/20 transition-colors">
                    ⬇ Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TIMETABLE SECTION ==================== */}
        {(section === 'dashboard' || section === 'timetable') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📅 Timetable Management</h2>
            <form onSubmit={handleAddTimetable} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <select value={ttDay} onChange={(e) => setTtDay(e.target.value)}
                className="px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm focus:outline-none focus:border-primary">
                {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input value={ttTimeSlot} onChange={(e) => setTtTimeSlot(e.target.value)} placeholder="e.g. 9:00-10:00"
                className="px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary" />
              <input value={ttSubject} onChange={(e) => setTtSubject(e.target.value)} placeholder="Subject"
                className="px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary" />
              <input value={ttClassroom} onChange={(e) => setTtClassroom(e.target.value)} placeholder="Room / Lab"
                className="px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary" />
              <input value={ttSemester} onChange={(e) => setTtSemester(e.target.value)} placeholder="e.g. Fall 2026"
                className="px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm placeholder-text-secondary/50 focus:outline-none focus:border-primary" />
              <button type="submit"
                className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors cursor-pointer">
                Add Entry
              </button>
            </form>

            <TimetableGrid entries={timetableEntries} />

            {/* Delete buttons */}
            {timetableEntries.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs text-text-secondary mb-2">Manage entries:</p>
                {timetableEntries.map((e) => (
                  <div key={e._id} className="flex items-center justify-between p-2 rounded-lg bg-dark/50 text-xs">
                    <span className="text-text-secondary">{e.day} · {e.timeSlot} · {e.subject}</span>
                    <button onClick={() => handleDeleteTimetable(e._id)}
                      className="text-red-400 hover:text-red-300 cursor-pointer">🗑 Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== MESSAGES SECTION ==================== */}
        {(section === 'dashboard' || section === 'messages') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">💬 Student Messages</h2>
            {conversations.length === 0 ? (
              <p className="text-text-secondary text-sm">No messages from students yet.</p>
            ) : (
              <div className="space-y-3">
                {conversations.map((convo) => (
                  <div key={convo.student.id} className="p-4 rounded-xl bg-dark/50 border border-dark-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                          {convo.student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-text-primary">{convo.student.name}</span>
                        {convo.unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold">{convo.unreadCount}</span>
                        )}
                      </div>
                      <button
                        onClick={() => loadStudentMessages(convo.student.id)}
                        className="text-xs text-primary hover:text-primary-light cursor-pointer">
                        View Messages
                      </button>
                    </div>

                    {/* Show messages if loaded */}
                    {studentMessages[convo.student.id] && (
                      <div className="mt-2 max-h-40 overflow-y-auto space-y-1 mb-2">
                        {studentMessages[convo.student.id].map((msg) => (
                          <div key={msg._id} className={`text-xs p-2 rounded-lg ${msg.senderRole === 'teacher' ? 'bg-primary/10 text-primary-light ml-8' : 'bg-dark-border/30 text-text-primary mr-8'}`}>
                            <span className="font-medium">{msg.senderRole === 'teacher' ? 'You' : convo.student.name}:</span> {msg.text}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="flex gap-2 mt-2">
                      <input
                        value={replyTexts[convo.student.id] || ''}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [convo.student.id]: e.target.value }))}
                        placeholder="Type a reply..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-dark border border-dark-border text-text-primary text-xs
                          placeholder-text-secondary/50 focus:outline-none focus:border-primary"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleReply(convo.student.id); }}
                      />
                      <button onClick={() => handleReply(convo.student.id)}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors cursor-pointer">
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== REPORTS SECTION ==================== */}
        {(section === 'dashboard' || section === 'reports') && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">📄 Semester Report</h2>
            <p className="text-text-secondary text-sm mb-4">
              Generate a comprehensive PDF report with attendance summary, uploaded materials, and timetable data.
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Add token to the URL for authentication
                const token = localStorage.getItem('token');
                if (token) {
                  const link = document.createElement('a');
                  link.href = `http://localhost:5000/api/report/generate?token=${token}`;
                  link.download = 'semester_report.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium
                hover:from-primary-dark hover:to-secondary transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              📥 Generate Semester Report
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// Stat Card Component used in the dashboard overview
const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl border border-dark-border p-5`}>
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
    <p className="text-xs text-text-secondary mt-1">{label}</p>
  </div>
);

export default TeacherDashboard;
