// ============================================
// TimetableGrid.jsx — Weekly Timetable Display
// ============================================
// Displays timetable as a grid: rows = time slots, columns = days.
// Has a day filter to show one day at a time on mobile.
// Wraps table in overflow-x:auto for horizontal scrolling on small screens.

import { useState } from 'react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TimetableGrid = ({ entries }) => {
  const [filterDay, setFilterDay] = useState('All'); // "All" or a specific day

  // Get unique time slots from the data, sorted
  const timeSlots = [...new Set(entries.map((e) => e.timeSlot))].sort();

  // Filter entries by selected day
  const filteredDays = filterDay === 'All' ? days : [filterDay];

  // Find what's scheduled for a specific day and time slot
  const getCell = (day, timeSlot) => {
    const entry = entries.find((e) => e.day === day && e.timeSlot === timeSlot);
    return entry ? { subject: entry.subject, classroom: entry.classroom } : null;
  };

  return (
    <div>
      {/* Day Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterDay('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
            ${filterDay === 'All'
              ? 'bg-primary text-white'
              : 'bg-dark-card border border-dark-border text-text-secondary hover:text-text-primary'
            }`}
        >
          All Days
        </button>
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setFilterDay(day)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
              ${filterDay === day
                ? 'bg-primary text-white'
                : 'bg-dark-card border border-dark-border text-text-secondary hover:text-text-primary'
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Grid — overflow-x:auto for mobile horizontal scrolling */}
      <div className="overflow-x-auto rounded-xl border border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dark-card">
              <th className="px-4 py-3 text-left text-text-secondary font-medium border-b border-dark-border">
                ⏰ Time
              </th>
              {filteredDays.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-center text-text-secondary font-medium border-b border-dark-border"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.length === 0 ? (
              <tr>
                <td
                  colSpan={filteredDays.length + 1}
                  className="px-4 py-8 text-center text-text-secondary"
                >
                  No timetable entries found.
                </td>
              </tr>
            ) : (
              timeSlots.map((slot) => (
                <tr key={slot} className="border-b border-dark-border/50 hover:bg-dark-card/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">
                    {slot}
                  </td>
                  {filteredDays.map((day) => {
                    const cell = getCell(day, slot);
                    return (
                      <td key={day} className="px-4 py-3 text-center">
                        {cell ? (
                          <div className="bg-primary/10 rounded-lg px-2 py-1.5 border border-primary/20">
                            <p className="font-medium text-primary-light text-xs">{cell.subject}</p>
                            <p className="text-[10px] text-text-secondary mt-0.5">📍 {cell.classroom}</p>
                          </div>
                        ) : (
                          <span className="text-text-secondary/40 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableGrid;
