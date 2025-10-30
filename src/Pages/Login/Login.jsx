import { useState } from "react";
import { loginApi } from "../../Apis/AuthApi/AuthApi";
import { useAuth } from "../../Utils/AuthContext";
import "./style.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      const token = {
        idToken: response.data?.idToken,
        refreshToken: response.data?.refreshToken,
      };

      await login(token, response.data?.uid);
      toast.success("Login successful!");
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !email || !password || loading;

  return (
    <div className="login-container">
      <div className="login-box dark-theme">
        <h2 className="login-title">Admin Login</h2>

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
              className="login-input dark-input"
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
              className="login-input dark-input"
              placeholder="Enter your password"
              required
            />
          </div>
          <div 
          onClick={() => navigate("/auth/forgot-password")}
          className="forgot-password-link">
            <p>Forgot Password?</p>
          </div>
          
          {/* Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`login-button ${isDisabled ? "disabled" : ""}`}
          >
            {loading ? <div className="spinner"></div> : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
