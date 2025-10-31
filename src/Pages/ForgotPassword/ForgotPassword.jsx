import { useState, useEffect } from "react";
import "./style.css";
import toast from "react-hot-toast";
import { sendOtpApi, resetPasswordUsingOtpApi } from "../../Apis/AuthApi/AuthApi";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import { useNavigate } from "react-router-dom";
import { BiArrowFromRight } from "react-icons/bi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // timer in seconds
  const navigate = useNavigate();

  // Countdown effect for timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSendOtp = async (isResend = false) => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    try {
      setLoading(true);
      const response = await sendOtpApi({ email });
      if (response?.data?.success) {
        toast.success(
          response?.data?.message ||
            (isResend ? "OTP resent successfully" : "OTP sent successfully")
        );
        setOtpSent(true);
        setTimer(120); // 2 minutes
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      toast.error(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    if (value.length <= 6) setOtp(value);
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6 || !newPassword) {
      toast.error("Please enter valid OTP and new password.");
      return;
    }
    try {
      setLoading(true);
      const response = await resetPasswordUsingOtpApi({ email, otp, newPassword });

        toast.success(response?.data?.message || "Password reset successfully");
        navigate("/auth/login");
      
    } catch (err) {
      console.error("Error resetting password:", err);
      toast.error(err.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2 className="forgot-title">Forgot Password</h2>

        <div className="back-login-btn" onClick={() => navigate("/auth/login")}>
          <BiArrowFromRight size={18} />
          <p>Back to login</p>
        </div>

        {/* Email Field */}
        <div className="forgot-form-group">
          <label className="forgot-label">
            <span className="required">*</span> Email
          </label>
          <input
            type="email"
            placeholder="Enter your registered email"
            className="forgot-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Send OTP Button */}
        {!otpSent && (
          <button
            onClick={() => handleSendOtp()}
            disabled={loading || !email}
            className={`forgot-btn ${!email || loading ? "disabled" : ""}`}
          >
            {loading ? <SmallSpinner /> : "Send OTP"}
          </button>
        )}

        {/* OTP + New Password Fields */}
        {otpSent && (
          <>
            <div className="forgot-form-group">
              <label className="forgot-label">
                <span className="required">*</span> OTP
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="forgot-input"
                value={otp}
                onChange={handleOtpChange}
                maxLength="6"
                inputMode="numeric"
              />
              <small style={{ color: "#bbb", fontSize: "0.8rem" }}>
                Enter the 6-digit code sent to your email
              </small>

              {/* Resend OTP Section */}
              <div className="resend-otp-section">
                {timer > 0 ? (
                  <p className="otp-timer">
                    Resend OTP in <strong>{formatTime(timer)}</strong>
                  </p>
                ) : (
                  <button
                    onClick={() => handleSendOtp(true)}
                    className="resend-otp-btn"
                    disabled={loading}
                  >
                    {loading ? <SmallSpinner /> : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>

            {/* Show new password only when OTP has 6 digits */}
            {otp.length === 6 && (
              <div className="forgot-form-group">
                <label className="forgot-label">
                  <span className="required">*</span> New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="forgot-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading || otp.length !== 6 || !newPassword}
              className={`forgot-btn ${
                loading || otp.length !== 6 || !newPassword ? "disabled" : ""
              }`}
            >
              {loading ? <SmallSpinner /> : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
