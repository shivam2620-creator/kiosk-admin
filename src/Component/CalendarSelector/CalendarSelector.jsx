import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAuth } from "../../Utils/AuthContext";
import { getAllCalenderApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import "./style.css";
import { setLoading } from "../../Redux/StudioSlice";

const CalendarSelector = ({
  selectedCalendarId,
  setSelectedCalendarId,
  mappingFunctionality = true, // ✅ default true
  studioId, // ✅ optional
  company,
  setCalendarEmbeddedCode,
  setCalendarPrice
}) => {
  const [allCalendar,setAllCalendar] = useState([])
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loading,setLoading] = useState(false);
  const {companyId,isSuperAdmin} = useAuth();
  



  const fetchAllCalendars = async() =>{
    try{
      setLoading(true)
      const res = await getAllCalenderApi(isSuperAdmin ? company : companyId);
      console.log(res)
       if(res?.data?.success){
               setAllCalendar(res.data.calendars)
          }
      
    }catch(err){
      console.log(err);
    }finally{
      setLoading(false)
    }
  }
useEffect(() => {
  if(companyId || company){
    fetchAllCalendars();
  }

},[companyId,company])
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
    console.log("calendar" , calendar)

    setSelectedCalendarId(calendar.id);
    setCalendarEmbeddedCode(calendar.calendarEmbeddedCode || "")
    setCalendarPrice(calendar.calendarPrice || 0)
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
