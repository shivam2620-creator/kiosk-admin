import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import "./style.css";

const CalendarSelector = ({ selectedCalendarId, setSelectedCalendarId }) => {
  const allCalendar = useSelector((state) => state.calendar.calendarData);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Filter calendars by search
  const filteredCalendars = useMemo(() => {
    return (
      allCalendar?.filter(
        (cal) =>
          cal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cal.calendarType?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    );
  }, [allCalendar, searchTerm]);

  const handleSelect = (calendar) => {
    setSelectedCalendarId(calendar.id);
    setDropdownOpen(false);
  };

  const selectedCalendar = allCalendar?.find(
    (cal) => cal.id === selectedCalendarId
  );

  return (
    <div className="calendar-selector" ref={dropdownRef}>
      <label className="calendar-label"><span className="required">*</span>Select Calendar:</label>

      <div
        className={`calendar-dropdown-input ${
          dropdownOpen ? "active" : ""
        }`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedCalendar ? (
          <span className={`${selectedCalendarId && "selected-cal"}`}>
            <strong>{selectedCalendar.name}</strong> <br />
            <small>{selectedCalendar.calendarType}</small>
          </span>
        ) : (
          "Choose a calendar"
        )}
        <span className="calendar-arrow">{dropdownOpen ? "▲" : "▼"}</span>
      </div>

      {dropdownOpen && (
        <div className="calendar-dropdown-menu">
          <input
            type="text"
            className="calendar-dropdown-search"
            placeholder="Search calendar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="calendar-dropdown-list">
            {filteredCalendars.length > 0 ? (
              filteredCalendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className={`calendar-dropdown-item ${
                    selectedCalendarId === calendar.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(calendar)}
                >
                  <div className="calendar-name">{calendar.name}</div>
                  <div className="calendar-type">
                    {calendar.calendarType || "N/A"}
                  </div>
                </div>
              ))
            ) : (
              <div className="calendar-no-results">No calendars found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSelector;
