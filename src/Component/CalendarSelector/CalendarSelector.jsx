import React, { useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../Utils/AuthContext";
import { getAllCalenderApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import { getStudioAyIdApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import "./style.css";

const CalendarSelector = ({
  selectedCalendarId,
  setSelectedCalendarId,
  mappingFunctionality = true,
  studioId = null,
  company = null,
  setCalendarEmbeddedCode = () => {},
  setCalendarPrice = () => {},
}) => {
  const [allCalendar, setAllCalendar] = useState([]);
  const [presentCalendarInStudio, setCalendarPresentInStudio] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: toggle to show only calendars that belong to the selected studio
  const [showOnlyStudioCalendars, setShowOnlyStudioCalendars] = useState(false);

  const dropdownRef = useRef(null);
  const { companyId, isSuperAdmin } = useAuth();

  // FETCH ALL CALENDARS
  const fetchAllCalendars = async () => {
    try {
      setLoading(true);
      const targetCompanyId = isSuperAdmin ? company : companyId;
      if (!targetCompanyId) return;

      const res = await getAllCalenderApi(targetCompanyId);
      if (res?.data?.success) {
        const list = res.data.calendars || [];
        setAllCalendar(list);
      } else {
        toast.error("Failed to fetch calendars");
      }
    } catch (err) {
      toast.error("Error fetching calendars");
    } finally {
      setLoading(false);
    }
  };

  // FETCH STUDIO CALENDARS
  const fetchStudioById = async () => {
    if (!studioId) {
      setCalendarPresentInStudio([]);
      return;
    }

    try {
      const targetCompanyId = isSuperAdmin ? company : companyId;
      const res = await getStudioAyIdApi(studioId, targetCompanyId);

      if (res?.data?.studio) {
        const { calendars = [] } = res.data.studio;
        setCalendarPresentInStudio(calendars);
      }
    } catch (err) {
      toast.error("Error fetching studio details");
    }
  };

  // EFFECTS
  useEffect(() => {
    const validCompany = isSuperAdmin ? company : companyId;
    if (validCompany) fetchAllCalendars();
    // reset selection when company changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, companyId, isSuperAdmin]);

  useEffect(() => {
    if (studioId) fetchStudioById();
    else setCalendarPresentInStudio([]);
  }, [studioId, companyId, company, isSuperAdmin]);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // FILTER CALENDARS (search by id/name/type, then optionally filter to studio calendars)
  const filteredCalendars = useMemo(() => {
    const q = (searchTerm || "").toLowerCase().trim();
    let list = allCalendar || [];

    if (q) {
      list = list.filter((cal) => {
        const name = (cal.name || "").toLowerCase();
        const type = (cal.calendarType || "").toLowerCase();
        const id = String(cal.id || "").toLowerCase();
        return name.includes(q) || type.includes(q) || id.includes(q);
      });
    }

    if (showOnlyStudioCalendars) {
      // only keep those calendar ids that are present in the studio
      if (!presentCalendarInStudio || presentCalendarInStudio.length === 0) return [];
      list = list.filter((cal) => presentCalendarInStudio.includes(cal.id));
    }

    return list;
  }, [allCalendar, searchTerm, showOnlyStudioCalendars, presentCalendarInStudio]);

  // SELECT CALENDAR
  const handleSelect = (calendar) => {
    const isCalendarMappedToThisStudio =
      presentCalendarInStudio.includes(calendar.id);

    const isMappedToAnotherStudio =
      mappingFunctionality &&
      calendar.isMapped &&
      !isCalendarMappedToThisStudio;

    if (isMappedToAnotherStudio) {
      toast.error("This calendar is already mapped to another studio.");
      return;
    }

    // ONLY LOG SELECTED CALENDAR
    console.log("Selected Calendar:", calendar);

    setSelectedCalendarId(calendar.id);
    setCalendarEmbeddedCode(calendar.calendarEmbeddedCode || "");
    setCalendarPrice(calendar.calendarPrice || 0);
    setDropdownOpen(false);
    setSearchTerm(""); // optional: clear search after selection
  };

  const selectedCalendar = allCalendar.find((c) => c.id === selectedCalendarId);

  return (
    <div className="calendar-selector" ref={dropdownRef}>
      <label className="calendar-label">
        <span className="required">*</span>Select Calendar:
      </label>

      {/* Dropdown trigger */}
      <div
        className={`calendar-dropdown-input ${dropdownOpen ? "active" : ""}`}
        onClick={() => setDropdownOpen((s) => !s)}
      >
        {loading ? (
          <div className="inline-loader">
            <SmallSpinner /> <span>Loading calendars...</span>
          </div>
        ) : selectedCalendar ? (
          <span className="selected-cal">
            <strong>{selectedCalendar.name}</strong>
            <br />
            <small>{selectedCalendar.calendarType}</small>
          </span>
        ) : (
          "Choose a calendar"
        )}
        <span className="calendar-arrow">{dropdownOpen ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown */}
      {dropdownOpen && !loading && (
        <div className="calendar-dropdown-menu">
          {/* NEW: toggle to show only calendars that belong to the selected studio */}
        { studioId &&   <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
            <input
              id="onlyStudioCal"
              type="checkbox"
              checked={showOnlyStudioCalendars}
              onChange={(e) => setShowOnlyStudioCalendars(e.target.checked)}
            />
            <label htmlFor="onlyStudioCal" style={{ fontSize: 13, color: "#ddd" }}>
              Show only calendars mapped with this studio
            </label>
          </div>}

          <input
            type="text"
            className="calendar-dropdown-search"
            placeholder="Search by Calendar ID or Calendar Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Search calendars by id or name"
          />

          <div className="calendar-dropdown-list">
            {showOnlyStudioCalendars && (!presentCalendarInStudio || presentCalendarInStudio.length === 0) ? (
              <div className="calendar-no-results">No calendars are linked to the selected studio.</div>
            ) : filteredCalendars.length > 0 ? (
              filteredCalendars.map((calendar) => {
                const isCalendarMappedToThisStudio =
                  presentCalendarInStudio.includes(calendar.id);

                const isMappedButNotInThisStudio =
                  calendar.isMapped && !isCalendarMappedToThisStudio;

                return (
                  <div
                    key={calendar.id}
                    className={`calendar-dropdown-item ${
                      selectedCalendarId === calendar.id ? "selected" : ""
                    } ${isMappedButNotInThisStudio ? "mapped" : ""}`}
                    onClick={() => handleSelect(calendar)}
                  >
                    <div className="calendar-info">
                      <div className="calendar-name">
                        {calendar.name}
                        {isMappedButNotInThisStudio && (
                          <span className="mapped-badge">Mapped</span>
                        )}
                      </div>
                      <div className="calendar-type">
                        {calendar.calendarType || "N/A"} • <small>ID: {calendar.id}</small>
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
