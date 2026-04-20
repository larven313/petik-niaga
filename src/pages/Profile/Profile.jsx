// Profile.jsx
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./Profile.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  // State data user (akun)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState(null);
  const [gambarBaru, setGambarBaru] = useState(null);
  const [userUuid, setUserUuid] = useState("");
  const [userId, setUserId] = useState(null);

  // State data pelanggan (profil)
  const [pelangganUuid, setPelangganUuid] = useState("");
  const [nama, setNama] = useState("");
  const [gender, setGender] = useState("L");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [kartu, setKartu] = useState(null);
  const [isPelanggan, setIsPelanggan] = useState(false); // ← apakah punya data pelanggan

  // State UI
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sukses, setSukses] = useState(false);
  const [activeTab, setActiveTab] = useState("akun"); // ← "akun" | "profil"

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Decode token untuk ambil userId
      const payload = JSON.parse(atob(token.split(".")[1]));
      const tokenUserId = payload.userId;
      setUserId(tokenUserId);

      // Ambil data user
      const resUsers = await axiosInstance.get(`${BASE_URL}/users`);
      const dataUser = resUsers.data.data.find((u) => u.id === tokenUserId);

      if (dataUser) {
        setUsername(dataUser.username);
        setEmail(dataUser.email || "");
        setRole(dataUser.role);
        setStatus(dataUser.status);
        setPreview(dataUser.url);
        setUserUuid(dataUser.uuid);
      }

      // Kalau role pelanggan, ambil data pelanggan juga
      if (dataUser?.role === "pelanggan") {
        const resPelanggan = await axiosInstance.get(`${BASE_URL}/pelanggan`);
        const dataPelanggan = resPelanggan.data.data.find(
          (p) => p.user_id === tokenUserId,
        );

        if (dataPelanggan) {
          setIsPelanggan(true);
          setPelangganUuid(dataPelanggan.uuid);
          setNama(dataPelanggan.nama);
          setGender(dataPelanggan.gender);
          setNoHp(dataPelanggan.no_hp);
          setAlamat(dataPelanggan.alamat || "");
          setTglLahir(dataPelanggan.tgl_lahir?.split("T")[0] || "");
          setKartu(dataPelanggan.kartu);
          setPreview(dataPelanggan.user?.url || dataUser?.url); // ← foto dari user
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGambarChange = (e) => {
    const file = e.target.files[0];
    setGambarBaru(file);
    setPreview(URL.createObjectURL(file));
  };

  // Submit data akun
  const handleSubmitAkun = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrors({});
    setSukses(false);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("role", role);
      formData.append("status", status);
      if (password) formData.append("password", password);
      if (gambarBaru) formData.append("gambar", gambarBaru);

      await axiosInstance.put(`${BASE_URL}/users/${userUuid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSukses(true);
      setPassword("");
      setGambarBaru(null);
      setTimeout(() => setSukses(false), 3000);
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
      setSaveLoading(false);
    }
  };

  // Submit data pelanggan
  const handleSubmitProfil = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrors({});
    setSukses(false);

    try {
      const formData = new FormData();
      formData.append("nama", nama);
      formData.append("gender", gender);
      formData.append("no_hp", noHp);
      formData.append("alamat", alamat);
      formData.append("tgl_lahir", tglLahir);

      await axiosInstance.put(
        `${BASE_URL}/pelanggan/${pelangganUuid}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setSukses(true);
      setTimeout(() => setSukses(false), 3000);
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
      setSaveLoading(false);
    }
  };

  if (loading) return <div className="profile-loading">Memuat profil...</div>;

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Profil Saya</h3>
      </div>

      <div className="profile-wrapper">
        {/* ── AVATAR CARD ── */}
        <div className="profile-avatar-card">
          <div className="profile-avatar">
            {preview ? (
              <img src={preview} alt="foto profil" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <h4 className="profile-nama">{isPelanggan ? nama : username}</h4>
          <span className="profile-role-badge">{role}</span>

          {/* Kartu membership kalau pelanggan */}
          {kartu && (
            <div className="profile-kartu">
              <span>🪪 {kartu.nama}</span>
              <small>Diskon {kartu.diskon * 100}%</small>
            </div>
          )}

          <label className="profile-upload-btn">
            📷 Ganti Foto
            <input
              type="file"
              accept="image/*"
              onChange={handleGambarChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* ── FORM AREA ── */}
        <div className="profile-form-area">
          {/* Tab hanya muncul kalau punya data pelanggan */}
          {isPelanggan && (
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === "akun" ? "active" : ""}`}
                onClick={() => setActiveTab("akun")}
              >
                Data Akun
              </button>
              <button
                className={`profile-tab ${activeTab === "profil" ? "active" : ""}`}
                onClick={() => setActiveTab("profil")}
              >
                Data Profil
              </button>
            </div>
          )}

          {/* ── TAB AKUN ── */}
          {activeTab === "akun" && (
            <form onSubmit={handleSubmitAkun} className="profile-form-card">
              {sukses && (
                <div className="profile-sukses">
                  ✅ Akun berhasil diperbarui
                </div>
              )}
              {errors.umum && (
                <div className="profile-error-banner">{errors.umum}</div>
              )}

              {/* Username */}
              <div className="profile-field">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={errors.username ? "input-error" : ""}
                  required
                />
                {errors.username && (
                  <span className="error">{errors.username}</span>
                )}
              </div>

              {/* Email */}
              <div className="profile-field">
                <label>
                  Email <span className="profile-optional">(opsional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="profile-field">
                <label>
                  Password{" "}
                  <span className="profile-optional">
                    (kosongkan jika tidak diganti)
                  </span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className={errors.password ? "input-error" : ""}
                />
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </div>

              {/* Role & Status */}
              <div className="profile-info-row">
                <div className="profile-info-item">
                  <span className="profile-info-label">Role</span>
                  <span className="profile-info-value">{role}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Status</span>
                  <span className={`profile-status ${status}`}>{status}</span>
                </div>
              </div>

              <div className="btn-group">
                <button
                  type="submit"
                  className="btn-add"
                  disabled={saveLoading}
                  style={{ width: "100%" }}
                >
                  {saveLoading ? "Menyimpan..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          )}

          {/* ── TAB PROFIL (hanya untuk pelanggan) ── */}
          {activeTab === "profil" && isPelanggan && (
            <form onSubmit={handleSubmitProfil} className="profile-form-card">
              {sukses && (
                <div className="profile-sukses">
                  ✅ Profil berhasil diperbarui
                </div>
              )}
              {errors.umum && (
                <div className="profile-error-banner">{errors.umum}</div>
              )}

              {/* Nama */}
              <div className="profile-field">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={errors.nama ? "input-error" : ""}
                  required
                />
                {errors.nama && <span className="error">{errors.nama}</span>}
              </div>

              {/* Gender */}
              <div className="profile-field">
                <label>Gender</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="L"
                      checked={gender === "L"}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Laki-laki
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="P"
                      checked={gender === "P"}
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              {/* No HP */}
              <div className="profile-field">
                <label>Nomor HP</label>
                <input
                  type="text"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={errors.no_hp ? "input-error" : ""}
                  required
                />
                {errors.no_hp && <span className="error">{errors.no_hp}</span>}
              </div>

              {/* Alamat */}
              <div className="profile-field">
                <label>Alamat</label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Contoh No. 1"
                  className={errors.alamat ? "input-error" : ""}
                />
                {errors.alamat && (
                  <span className="error">{errors.alamat}</span>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div className="profile-field">
                <label>Tanggal Lahir</label>
                <input
                  type="date"
                  value={tglLahir}
                  onChange={(e) => setTglLahir(e.target.value)}
                  className={errors.tgl_lahir ? "input-error" : ""}
                />
                {errors.tgl_lahir && (
                  <span className="error">{errors.tgl_lahir}</span>
                )}
              </div>

              <div className="btn-group">
                <button
                  type="submit"
                  className="btn-add"
                  disabled={saveLoading}
                  style={{ width: "100%" }}
                >
                  {saveLoading ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
