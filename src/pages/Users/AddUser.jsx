import axiosInstance from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Users.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const AddUser = () => {
  const navigate = useNavigate();

  // State data user
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("pelanggan");
  const [status, setStatus] = useState("aktif");

  // State data pelanggan (hanya muncul kalau role = pelanggan)
  const [nama, setNama] = useState("");
  const [gender, setGender] = useState("L");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [kartuId, setKartuId] = useState("");
  const [kartuList, setKartuList] = useState([]);

  // State gambar
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);

  // State UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role === "pelanggan") {
      getKartuList(); // ← ambil list kartu hanya kalau role pelanggan
    }
  }, [role]);

  const getKartuList = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/kartu`);
      setKartuList(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGambarChange = (e) => {
    const file = e.target.files[0];
    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // ── STEP 1: Buat akun user ──
      const userFormData = new FormData();
      userFormData.append("username", username);
      userFormData.append("email", email);
      userFormData.append("password", password);
      userFormData.append("role", role);
      userFormData.append("status", status);
      if (gambar) userFormData.append("gambar", gambar);

      const userResponse = await axiosInstance.post(
        `${BASE_URL}/users`,
        userFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // ── STEP 2: Kalau role pelanggan, buat data pelanggan juga ──
      if (role === "pelanggan") {
        const newUserId = userResponse.data.data.id; // ← ambil id user baru

        const pelangganFormData = new FormData();
        pelangganFormData.append("nama", nama);
        pelangganFormData.append("gender", gender);
        pelangganFormData.append("no_hp", noHp);
        pelangganFormData.append("alamat", alamat);
        pelangganFormData.append("tgl_lahir", tglLahir);
        pelangganFormData.append("kartu_id", kartuId);
        pelangganFormData.append("user_id", newUserId);

        await axiosInstance.post(`${BASE_URL}/pelanggan`, pelangganFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

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
        <h3>Tambah User</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* ════════════════════════════
              DATA AKUN USER
          ════════════════════════════ */}

          {/* Username */}
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: budi123"
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
              placeholder="Contoh: budi@email.com"
              className={errors.email && "input-error"}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className={errors.password && "input-error"}
              required
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

          {/* ════════════════════════════
              DATA PELANGGAN
              (hanya muncul kalau role = pelanggan)
          ════════════════════════════ */}

          {role === "pelanggan" && (
            <>
              {/* Nama */}
              <div>
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className={errors.nama && "input-error"}
                  required
                />
                {errors.nama && <span className="error">{errors.nama}</span>}
              </div>

              {/* Gender */}
              <div>
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
                {errors.gender && (
                  <span className="error">{errors.gender}</span>
                )}
              </div>

              {/* Nomor HP */}
              <div>
                <label htmlFor="nohp">Nomor HP</label>
                <input
                  type="text"
                  value={noHp}
                  id="nohp"
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className={errors.no_hp && "input-error"}
                  required
                />
                {errors.no_hp && <span className="error">{errors.no_hp}</span>}
              </div>

              {/* Alamat */}
              <div>
                <label>Alamat</label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Merdeka No. 1"
                  className={errors.alamat && "input-error"}
                  required
                />
                {errors.alamat && (
                  <span className="error">{errors.alamat}</span>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label>Tanggal Lahir</label>
                <input
                  type="date"
                  value={tglLahir}
                  onChange={(e) => setTglLahir(e.target.value)}
                  className={errors.tgl_lahir && "input-error"}
                  required
                />
                {errors.tgl_lahir && (
                  <span className="error">{errors.tgl_lahir}</span>
                )}
              </div>

              {/* Membership */}
              <div>
                <label>Membership</label>
                <select
                  value={kartuId}
                  onChange={(e) => setKartuId(e.target.value)}
                  className={errors.kartu_id && "input-error"}
                  required
                >
                  <option value="" disabled>
                    - Pilih -
                  </option>
                  {kartuList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
                {errors.kartu_id && (
                  <span className="error">{errors.kartu_id}</span>
                )}
              </div>
            </>
          )}

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

export default AddUser;
