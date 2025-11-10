import React, { useState } from "react";
import "./style.css";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import updateBrandingApi from "../../Apis/SuperAdminApis/UpdateBrandingApi";
import { useAuth } from "../../Utils/AuthContext";
import toast from "react-hot-toast";

const testingCalendarId = "FN6xZNwzren3122Bq1JI"
const UpdateCalendar = () => {
  const { companyId } = useAuth(); // ✅ fixed typo (was compoanyId)
  const [loading, setLoading] = useState(false);

  // Pre-fill test data
  const [calendarId, setCalendarId] = useState("FN6xZNwzren3122Bq1JI");
  const [calendarEmbeddedCode, setCalendarEmbeddedCode] = useState(
    `<iframe src="https://links.tattooagency.com/widget/booking/FN6xZNwzren3122Bq1JI" 
    style="width: 100%;border:none;overflow: hidden;" 
    scrolling="no" 
    id="FN6xZNwzren3122Bq1JI_1761197866711"></iframe><br>
    <script src="https://links.tattooagency.com/js/form_embed.js" type="text/javascript"></script>`
  );
  const [calendarPrice, setCalendarPrice] = useState(101);

  const handleUpdate = async () => {
    if (!calendarId || !calendarEmbeddedCode || !calendarPrice) {
      toast.error("Please fill all fields before updating.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        calendarId : testingCalendarId,
        calendarEmbeddedCode,
        calendarPrice: Number(calendarPrice),
      };

      const response = await updateBrandingApi(companyId, payload);

      if (response?.data?.success) {
        toast.success(response.data.message || "Calendar updated successfully!");
      } else {
        toast.error(response?.data?.message || "Failed to update calendar.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-calendar-container">
      <h2 className="update-calendar-title">Update Calendar Details</h2>

      {/* Calendar ID Selector */}
      <div className="form-section">
        <label>Calendar</label>
        <CalendarSelector
          selectedCalendarId={calendarId}
          setSelectedCalendarId={setCalendarId}
        />
      </div>

      {/* Embedded Code */}
      <div className="form-section">
        <label>Calendar Embedded Code</label>
        <textarea
          value={calendarEmbeddedCode}
          onChange={(e) => setCalendarEmbeddedCode(e.target.value)}
          rows="8"
          className="textarea-input"
          placeholder="Paste your embedded code here..."
        />
      </div>

      {/* Price */}
      <div className="form-section">
        <label>Calendar Price ($)</label>
        <input
          type="number"
          className="text-input"
          value={calendarPrice}
          onChange={(e) => setCalendarPrice(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="update-btn"
      >
        {loading ? "Updating..." : "Update Calendar"}
      </button>
    </div>
  );
};

export default UpdateCalendar;
