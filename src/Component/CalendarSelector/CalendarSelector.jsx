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
    if (!studioId) return;

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
  }, [company, companyId]);

  useEffect(() => {
    if (studioId) fetchStudioById();
  }, [studioId]);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // FILTER CALENDARS
  const filteredCalendars = useMemo(() => {
    return (
      allCalendar?.filter(
        (cal) =>
          (cal.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (cal.calendarType || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      ) || []
    );
  }, [allCalendar, searchTerm]);

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

    // 🔥 ONLY LOG LEFT
    console.log("Selected Calendar:", calendar);

    setSelectedCalendarId(calendar.id);
    setCalendarEmbeddedCode(calendar.calendarEmbeddedCode || "");
    setCalendarPrice(calendar.calendarPrice || 0);
    setDropdownOpen(false);
  };

  const selectedCalendar = allCalendar.find(
    (c) => c.id === selectedCalendarId
  );

  return (
    <div className="calendar-selector" ref={dropdownRef}>
      <label className="calendar-label">
        <span className="required">*</span>Select Calendar:
      </label>

      {/* Dropdown trigger */}
      <div
        className={`calendar-dropdown-input ${dropdownOpen ? "active" : ""}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
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
          <input
            type="text"
            className="calendar-dropdown-search"
            placeholder="Search calendar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="calendar-dropdown-list">
            {filteredCalendars.map((calendar) => {
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
                      {calendar.calendarType || "N/A"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSelector;
