import "./style.css";
import axiosInstance from "../../Apis/axiosInstance";
import { useEffect, useState } from "react";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { FaDownload, FaExternalLinkAlt, FaTimes } from "react-icons/fa";

const DetailedAppointmentModal = ({ appointmentId, onClose }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/appointment/${appointmentId}`);
      if (res.data.success) {
        setAppointment(res.data.appointment);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) fetchAppointmentDetail();
  }, [appointmentId]);

  if (!appointmentId) return null;

  return (
    <div className="appointment-modal-overlay">
      <div className="appointment-modal">
        {/* Sticky Header */}
        <div className="modal-header sticky-header">
          <h2>Appointment Details</h2>
          <button className="close-btn-small" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="loading-section">
            <MediumSpinner />
            <p>Loading details...</p>
          </div>
        ) : !appointment ? (
          <p className="no-data">No details found.</p>
        ) : (
          <>
            {/* CLIENT INFO */}
            <section className="info-section">
              <h3>Client Information</h3>
              <div className="info-grid">
                <p><strong>Name:</strong> {appointment.fullName || appointment.name}</p>
                <p><strong>Email:</strong> {appointment.email}</p>
                <p><strong>Phone:</strong> {appointment.phone}</p>
                <p><strong>Age Group:</strong> {appointment.ageGroup}</p>
                <p><strong>Address:</strong> {appointment.full_address}</p>
                <p><strong>City:</strong> {appointment.city}</p>
                <p><strong>State:</strong> {appointment.state}</p>
                <p><strong>Country:</strong> {appointment.country}</p>
              </div>
            </section>

            {/* APPOINTMENT INFO */}
            <section className="info-section">
              <h3>Appointment Details</h3>
              <div className="info-grid">
                <p><strong>Reference ID:</strong> {appointment.referenceId}</p>
                <p><strong>Service:</strong> {appointment.service}</p>
                <p><strong>Sub Type:</strong> {appointment.sub_type}</p>
                <p><strong>Calendar:</strong> {appointment.calendarName}</p>
                <p><strong>Amount:</strong> ₹{appointment.amount}</p>
                <p><strong>Status:</strong> {appointment.appointmentStatus}</p>
                <p><strong>Date of Procedure:</strong> {appointment.dateOfProcedure}</p>
                <p><strong>Start Time:</strong> {new Date(appointment.startTime).toLocaleString()}</p>
                <p><strong>End Time:</strong> {new Date(appointment.endTime).toLocaleString()}</p>
                <p><strong>Studio ID:</strong> {appointment.studioId}</p>
              </div>
            </section>

            {/* CONSENT & DOCUMENTS */}
            <section className="info-section">
              <h3>Consent & Signatures</h3>
              <div className="button-grid">
                {appointment.clientSignature && (
                  <div className="file-btn">
                    <span>Client Signature:</span>
                    <div>
                      <a
                        href={appointment.clientSignature}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn secondary"
                      >
                        <FaExternalLinkAlt /> View
                      </a>
                      <a
                        href={appointment.clientSignature}
                        download
                        className="btn primary"
                      >
                        <FaDownload /> Download
                      </a>
                    </div>
                  </div>
                )}

                {appointment.minorSignature && (
                  <div className="file-btn">
                    <span>Minor Signature:</span>
                    <div>
                      <a
                        href={appointment.minorSignature}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn secondary"
                      >
                        <FaExternalLinkAlt /> View
                      </a>
                      <a
                        href={appointment.minorSignature}
                        download
                        className="btn primary"
                      >
                        <FaDownload /> Download
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* QR CODES */}
            <section className="info-section">
              <h3>QR Codes</h3>
              <div className="qr-grid">
                {appointment.qrCode?.url && (
                  <div className="qr-item">
                    <img
                      src={appointment.qrCode.url}
                      alt="Client QR"
                      className="qr-img"
                    />
                    <p>Client QR Code</p>
                  </div>
                )}
                {appointment.staffConsentQrCode?.url && (
                  <div className="qr-item">
                    <img
                      src={appointment.staffConsentQrCode.url}
                      alt="Staff Consent QR"
                      className="qr-img"
                    />
                    <p>Staff Consent QR</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailedAppointmentModal;
