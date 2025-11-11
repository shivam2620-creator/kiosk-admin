import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "./style.css";

const CalendarSelector = ({
  selectedCalendarId,
  setSelectedCalendarId,
  mappingFunctionality = true, // ✅ default true
  studioId, // ✅ optional
}) => {
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

  // ✅ Handle calendar selection logic
  const handleSelect = (calendar) => {
    // If mapping logic is enabled and it's mapped to ANOTHER studio
    const isMappedToAnotherStudio =
      mappingFunctionality &&
      calendar.isMapped &&
      calendar.studioId !== studioId;

    if (isMappedToAnotherStudio) {
      toast.error("This calendar is already mapped to another studio.");
      return;
    }

    setSelectedCalendarId(calendar.id);
    setDropdownOpen(false);
  };

  const selectedCalendar = allCalendar?.find(
    (cal) => cal.id === selectedCalendarId
  );

  return (
    <div className="calendar-selector" ref={dropdownRef}>
      <label className="calendar-label">
        <span className="required">*</span>Select Calendar:
      </label>

      <div
        className={`calendar-dropdown-input ${dropdownOpen ? "active" : ""}`}
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
              filteredCalendars.map((calendar) => {
                // ✅ Determine if calendar should appear "mapped"
                const isMappedToAnotherStudio =
                  mappingFunctionality &&
                  calendar.isMapped &&
                  calendar.studioId !== studioId;

                return (
                  <div
                    key={calendar.id}
                    className={`calendar-dropdown-item ${
                      selectedCalendarId === calendar.id ? "selected" : ""
                    } ${isMappedToAnotherStudio ? "mapped" : ""}`}
                    onClick={() => handleSelect(calendar)}
                  >
                    <div className="calendar-info">
                      <div className="calendar-name">
                        {calendar.name}
                        {/* ✅ Show badge only if it's mapped to a different studio */}
                        {isMappedToAnotherStudio && (
                          <span className="mapped-badge">Mapped</span>
                        )}
                      </div>
                      <div className="calendar-type">
                        {calendar.calendarType || "N/A"}
                      </div>
                    </div>
                  </div>
                );
              })
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
