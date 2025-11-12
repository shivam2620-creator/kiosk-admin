// DetailedAppointmentModal.jsx
import "./style.css";
import axiosInstance from "../../Apis/axiosInstance";
import { useEffect, useRef, useState } from "react";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { FaDownload, FaExternalLinkAlt, FaTimes } from "react-icons/fa";

const DetailedAppointmentModal = ({ appointmentId, onClose }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/appointment/${appointmentId}`);
      if (res?.data?.success) {
        setAppointment(res.data.appointment);
      } else {
        setAppointment(null);
      }
    } catch (err) {
      console.error("Error fetching appointment detail:", err);
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) fetchAppointmentDetail();
  }, [appointmentId]);

  // Prevent background scroll, save/restore focus, focus first element
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";

    // focus the modal close button after mount
    const focusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();

    return () => {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, []);

  // Close on ESC and trap Tab key inside modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    // close only when clicking the overlay (not the modal)
    if (e.target === overlayRef.current) onClose();
  };

  // Safe helpers
  const safe = (val) => (val === undefined || val === null || val === "" ? "-" : val);

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  if (!appointmentId) return null;

  return (
    <div
      className="appointment-modal-overlay"
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointmentModalTitle"
    >
      <div
        className="appointment-modal"
        ref={modalRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="modal-header sticky-header">
          <h2 id="appointmentModalTitle">Appointment Details</h2>
          <button
            className="close-btn-small"
            onClick={onClose}
            aria-label="Close appointment details"
          >
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="loading-section">
            <MediumSpinner />
            <p>Loading details...</p>
          </div>
        ) : !appointment ? (
          <div className="no-data-section">
            <p className="no-data">No details found.</p>
          </div>
        ) : (
          <>
            {/* CLIENT INFO */}
            <section className="info-section">
              <h3>Client Information</h3>
              <div className="info-grid">
                <p>
                  <strong>Name:</strong> {safe(appointment.fullName || appointment.name)}
                </p>
                <p>
                  <strong>Email:</strong> {safe(appointment.email)}
                </p>
                <p>
                  <strong>Phone:</strong> {safe(appointment.phone)}
                </p>
                <p>
                  <strong>Age Group:</strong> {safe(appointment.ageGroup)}
                </p>
                <p>
                  <strong>Address:</strong> {safe(appointment.full_address)}
                </p>
                <p>
                  <strong>City:</strong> {safe(appointment.city)}
                </p>
                <p>
                  <strong>State:</strong> {safe(appointment.state)}
                </p>
                <p>
                  <strong>Country:</strong> {safe(appointment.country)}
                </p>
              </div>
            </section>

            {/* APPOINTMENT INFO */}
            <section className="info-section">
              <h3>Appointment Details</h3>
              <div className="info-grid">
                <p><strong>Reference ID:</strong> {safe(appointment.referenceId)}</p>
                <p><strong>Service:</strong> {safe(appointment.service)}</p>
                <p><strong>Sub Type:</strong> {safe(appointment.sub_type)}</p>
                <p><strong>Calendar:</strong> {safe(appointment.calendarName)}</p>
                <p><strong>Amount:</strong> {appointment.amount ? `₹${appointment.amount}` : "-"}</p>
                <p><strong>Status:</strong> {safe(appointment.appointmentStatus)}</p>
                <p><strong>Date of Procedure:</strong> {formatDate(appointment.dateOfProcedure)}</p>
                <p><strong>Start Time:</strong> {formatDateTime(appointment.startTime)}</p>
                <p><strong>End Time:</strong> {formatDateTime(appointment.endTime)}</p>
                <p><strong>Studio ID:</strong> {safe(appointment.studioId)}</p>
              </div>
            </section>

            {/* CONSENT & DOCUMENTS */}
            <section className="info-section">
              <h3>Consent & Signatures</h3>
              <div className="button-grid">
                {appointment.clientSignature ? (
                  <div className="file-btn">
                    <span>Client Signature:</span>
                    <div>
                      <a
                        href={appointment.clientSignature}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn secondary"
                        aria-label="View client signature"
                      >
                        <FaExternalLinkAlt /> View
                      </a>
                      <a
                        href={appointment.clientSignature}
                        download={`${appointment.referenceId || "client-signature"}.png`}
                        className="btn primary"
                        aria-label="Download client signature"
                      >
                        <FaDownload /> Download
                      </a>
                    </div>
                  </div>
                ) : null}

                {appointment.minorSignature ? (
                  <div className="file-btn">
                    <span>Minor Signature:</span>
                    <div>
                      <a
                        href={appointment.minorSignature}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn secondary"
                        aria-label="View minor signature"
                      >
                        <FaExternalLinkAlt /> View
                      </a>
                      <a
                        href={appointment.minorSignature}
                        download={`${appointment.referenceId || "minor-signature"}.png`}
                        className="btn primary"
                        aria-label="Download minor signature"
                      >
                        <FaDownload /> Download
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {/* QR CODES */}
            <section className="info-section">
              <h3>QR Codes</h3>
              <div className="qr-grid">
                {appointment.qrCode?.url ? (
                  <div className="qr-item">
                    <img
                      src={appointment.qrCode.url}
                      alt="Client QR code"
                      className="qr-img"
                      loading="lazy"
                    />
                    <p>Client QR Code</p>
                  </div>
                ) : null}
                {appointment.staffConsentQrCode?.url ? (
                  <div className="qr-item">
                    <img
                      src={appointment.staffConsentQrCode.url}
                      alt="Staff consent QR code"
                      className="qr-img"
                      loading="lazy"
                    />
                    <p>Staff Consent QR</p>
                  </div>
                ) : null}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailedAppointmentModal;
