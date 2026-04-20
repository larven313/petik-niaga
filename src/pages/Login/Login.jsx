// Login.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const AUTH_URL = import.meta.env.VITE_AUTH_URL;

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.role === "pelanggan") {
        navigate("/", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${AUTH_URL}/login`, {
        username,
        password,
      });

      const token = response.data.token;
      const decoded = jwtDecode(token); // ← decode untuk cek role

      localStorage.setItem("token", token);

      // ← arahkan berdasarkan role
      if (decoded.role === "pelanggan") {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Login gagal, coba lagi";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Login google berhasil:", decoded);

      const response = await axios.post(`${AUTH_URL}/login/google`, {
        token: credentialResponse.credential,
      });

      const token = response.data.token;
      const decodedApp = jwtDecode(token); // ← decode token dari backend

      localStorage.setItem("token", token);
      localStorage.setItem("loginType", "google");

      // ← arahkan berdasarkan role
      if (decodedApp.role === "pelanggan") {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Gagal login Google:", err);
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Login dengan Google gagal, coba lagi",
      );
    }
  };
  const handleGoogleError = () => {
    // FIX: hapus error.response yang tidak valid di sini
    console.error("Login google gagal");
    setError("Login dengan Google gagal, coba lagi");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <NavLink
            to={"/"}
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            <div className="login-logo-icon">P</div>
          </NavLink>
          <h2>Petik Niaga</h2>
          <p>Masuk ke dashboard admin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Username */}
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className={error ? "login-input-error" : ""}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className={error ? "login-input-error" : ""}
              required
            />
          </div>

          {/* Error */}
          {error && <span className="login-error">{error}</span>}

          {/* Submit */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div className="login-divider">
            <span>atau masuk dengan</span>
          </div>

          {/* Login Google */}
          <div className="login-google">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="500"
              text="signin_with"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
