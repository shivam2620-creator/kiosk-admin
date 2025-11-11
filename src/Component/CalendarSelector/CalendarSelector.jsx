import React, { useState, useRef, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../Utils/AuthContext";
import { getAllCalenderApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import { getStudioAyIdApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import "./style.css";

const CalendarSelector = ({
  selectedCalendarId,
  setSelectedCalendarId, // ✅ required
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

  // ✅ Fetch calendars from API
  const fetchAllCalendars = async () => {
    try {
      setLoading(true);
      const targetCompanyId = isSuperAdmin ? company : companyId;
      if (!targetCompanyId) return;

      const res = await getAllCalenderApi(targetCompanyId);
      if (res?.data?.success) {
        setAllCalendar(res.data.calendars || []);
      } else {
        toast.error("Failed to fetch calendars");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching calendars");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch studio details to know which calendars it already has
  const fetchStudioById = async () => {
    if (!studioId) return; // only fetch when needed
    try {
      const targetCompanyId = isSuperAdmin ? company : companyId;
      const res = await getStudioAyIdApi(studioId, targetCompanyId);
      if (res?.data?.studio) {
        const { calendars = [] } = res.data.studio;
        setCalendarPresentInStudio(calendars);
      }
    } catch (err) {
      console.error("Error fetching studio details:", err);
    }
  };

  // ✅ Fetch calendars when company changes
  useEffect(() => {
    const validCompany = isSuperAdmin ? company : companyId;
    if (validCompany) {
      fetchAllCalendars();
    }
  }, [companyId, company, isSuperAdmin]);

  // ✅ Fetch studio data when studioId changes
  useEffect(() => {
    if (studioId) {
      fetchStudioById();
    }
  }, [studioId]);

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

  // ✅ Filter calendars
  const filteredCalendars = useMemo(() => {
    return (
      allCalendar?.filter(
        (cal) =>
          cal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cal.calendarType?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    );
  }, [allCalendar, searchTerm]);

  // ✅ Handle select
  const handleSelect = (calendar) => {
    const isCalendarMappedToThisStudio = presentCalendarInStudio.includes(
      calendar.id
    );

    // If mapping is enabled and it's mapped elsewhere
    const isMappedToAnotherStudio =
      mappingFunctionality &&
      calendar.isMapped &&
      !isCalendarMappedToThisStudio;

    if (isMappedToAnotherStudio) {
      toast.error("This calendar is already mapped to another studio.");
      return;
    }
    console.log("selected calendar", selectedCalendar)

    setSelectedCalendarId(calendar.id);
    setCalendarEmbeddedCode(calendar.calendarEmbeddedCode || "");
    setCalendarPrice(calendar.calendarPrice || 0);
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

      {/* Dropdown input */}
      <div
        className={`calendar-dropdown-input ${dropdownOpen ? "active" : ""}`}
        onClick={() => !loading && setDropdownOpen(!dropdownOpen)}
        style={{ position: "relative" }}
      >
        {loading ? (
          <div className="inline-loader">
            <SmallSpinner />
            <span
              style={{
                marginLeft: "8px",
                fontSize: "13px",
                opacity: 0.8,
              }}
            >
              Loading calendars...
            </span>
          </div>
        ) : selectedCalendar ? (
          <span className={`${selectedCalendarId && "selected-cal"}`}>
            <strong>{selectedCalendar.name}</strong> <br />
            <small>{selectedCalendar.calendarType}</small>
          </span>
        ) : (
          "Choose a calendar"
        )}
        {!loading && (
          <span className="calendar-arrow">{dropdownOpen ? "▲" : "▼"}</span>
        )}
      </div>

      {/* Dropdown list */}
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
           {filteredCalendars.length > 0 ? (
  filteredCalendars.map((calendar) => {
    const isCalendarMappedToThisStudio =
      presentCalendarInStudio.includes(calendar.id);

    // ✅ Only mark as mapped if it's mapped but NOT in current studio
    const isMappedButNotInThisStudio =
      mappingFunctionality && calendar.isMapped && !isCalendarMappedToThisStudio;

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
            {/* 🚫 Show badge only if mapped but not in current studio */}
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
