// LoginPage.jsx
import { useState } from "react";
import "./style.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      alert(`Logged in as ${email}`);
    }, 1500);
  };

  const isDisabled = !email || !password || loading;

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleLogin} className="login-form">
          {/* Email */}
          <div className="login-form-group">
          <label className="login-label">
            <span className="required">*</span> Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="Enter your email"
            required
          />
          </div>

          {/* Password */}
          <div className="login-form-group">
          <label className="login-label">
            <span className="required">*</span> Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="Enter your password"
            required
          />
            </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`login-button ${isDisabled ? "disabled" : ""}`}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
