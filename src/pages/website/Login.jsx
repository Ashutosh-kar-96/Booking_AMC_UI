import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { LOGIN_URL } from "../../services/endpoints";

const ClientLogin = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 prevent refresh
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await api.post(LOGIN_URL, {
        user_name: e.target.email.value, // backend expects user_name
        password: e.target.password.value,
      });

      const { token, user } = res.data;

      // Store token & user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on user_type
      if (user.user_type === 1 || user.user_type === 2) {
        navigate("/admin");
      } else if (user.user_type === 3) {
        navigate("/vendor");
      } else {
        navigate("/");
      }

    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <section
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(30,58,138,0.95), rgba(30,58,138,0.85)), url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80') center/cover",
          padding: "180px 0 100px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div className="container">
          <span
            className="badge"
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              marginBottom: "20px",
            }}
          >
            Client Portal
          </span>

          <h1 style={{ fontSize: "3.5rem", marginBottom: "20px" }}>
            Secure Login
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              maxWidth: "600px",
              margin: "0 auto",
              opacity: 0.9,
            }}
          >
            Access your dashboard to manage contracts, schedule services, and view reports.
          </p>
        </div>
      </section>

      {/* ================= LOGIN SECTION ================= */}
      <section className="login-section">
        <div className="container">
          <div className="login-card">
            <div className="login-header">
              <img
                src="/images/bookamc logo.png"
                alt="BookAMC Logo"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/200x50/1e3a8a/ffffff?text=BookAMC";
                }}
              />
              <h2>Welcome Back</h2>
              <p>Sign in to access your AMC dashboard.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Error Message */}
              {errorMessage && (
                <div style={{ color: "red", marginBottom: "15px" }}>
                  {errorMessage}
                </div>
              )}

              <div className="form-group">
                <label>Email / Username</label>
                <input
                  type="text"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email or username"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="login-options">
                <label className="checkbox-group">
                  <input type="checkbox" name="remember" /> Remember me
                </label>
                <a href="#">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-large"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ClientLogin;