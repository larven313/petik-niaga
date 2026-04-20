import axiosInstance from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Users.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const EditUser = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();

  // State data user
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // ← kosong = tidak ganti password
  const [role, setRole] = useState("pelanggan");
  const [status, setStatus] = useState("aktif");

  // State gambar
  const [gambarBaru, setGambarBaru] = useState(null);
  const [preview, setPreview] = useState(null);

  // State UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getUserByID();
  }, []);

  const getUserByID = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/users/${uuid}`);
      const data = response.data.data;

      // Isi form dengan data lama
      setUsername(data.username);
      setEmail(data.email || "");
      setRole(data.role);
      setStatus(data.status);
      setPreview(data.url); // ← tampilkan foto lama
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleGambarChange = (e) => {
    const file = e.target.files[0];
    setGambarBaru(file);
    setPreview(URL.createObjectURL(file)); // ← preview foto baru
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("role", role);
      formData.append("status", status);
      if (password) formData.append("password", password); // ← hanya kirim kalau diisi
      if (gambarBaru) formData.append("gambar", gambarBaru);

      await axiosInstance.put(`${BASE_URL}/users/${uuid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(-1);
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [];

      if (apiErrors.length > 0) {
        const errorPerField = {};
        apiErrors.forEach((e) => {
          errorPerField[e.path] = e.msg;
        });
        setErrors(errorPerField);
      } else {
        setErrors({ umum: err.response?.data?.msg || "Gagal menyimpan" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Edit User</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* Username */}
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username && "input-error"}
              required
            />
            {errors.username && (
              <span className="error">{errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label>
              Email{" "}
              <span style={{ color: "#aaa", fontSize: 12 }}>(opsional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email && "input-error"}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div>
            <label>
              Password{" "}
              <span style={{ color: "#aaa", fontSize: 12 }}>
                (kosongkan jika tidak diganti)
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className={errors.password && "input-error"}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          {/* Role */}
          <div>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={errors.role && "input-error"}
              required
            >
              <option value="pelanggan">Pelanggan</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            {errors.role && <span className="error">{errors.role}</span>}
          </div>

          {/* Status */}
          <div>
            <label>Status</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="aktif"
                  checked={status === "aktif"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Aktif
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="nonaktif"
                  checked={status === "nonaktif"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Nonaktif
              </label>
            </div>
            {errors.status && <span className="error">{errors.status}</span>}
          </div>

          {/* Foto */}
          <div>
            <label>
              Foto{" "}
              <span style={{ color: "#aaa", fontSize: 12 }}>(opsional)</span>
            </label>
            <input type="file" accept="image/*" onChange={handleGambarChange} />
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ width: 120, marginTop: 10, borderRadius: 8 }}
              />
            )}
            {errors.umum && <span className="error">{errors.umum}</span>}
          </div>

          {/* Tombol Aksi */}
          <div className="btn-group form-full">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-delete"
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-tambah" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
