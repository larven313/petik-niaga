import axiosInstance from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Pelanggan.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const AddPelanggan = () => {
  const navigate = useNavigate();

  // State data pelanggan
  const [nama, setNama] = useState("");
  const [gender, setGender] = useState("L");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [kartuId, setKartuId] = useState("");

  // State data akun
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // State gambar
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);

  // State UI
  const [kartuList, setKartuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getKartuList();
  }, []);

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
      // ── STEP 1: Buat akun user dulu ──
      const userFormData = new FormData();
      userFormData.append("username", username);
      userFormData.append("password", password);
      userFormData.append("email", email);
      userFormData.append("role", "pelanggan");
      userFormData.append("status", "aktif");
      if (gambar) userFormData.append("gambar", gambar);

      const userResponse = await axiosInstance.post(
        `${BASE_URL}/users`,
        userFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // Ambil id user yang baru dibuat
      const newUserId = userResponse.data.data.id;

      // ── STEP 2: Buat pelanggan dengan user_id dari step 1 ──
      const pelangganFormData = new FormData();
      pelangganFormData.append("nama", nama);
      pelangganFormData.append("gender", gender);
      pelangganFormData.append("no_hp", noHp);
      pelangganFormData.append("alamat", alamat);
      pelangganFormData.append("tgl_lahir", tglLahir);
      pelangganFormData.append("kartu_id", kartuId);
      pelangganFormData.append("user_id", newUserId); // ← pakai id dari step 1

      await axiosInstance.post(`${BASE_URL}/pelanggan`, pelangganFormData, {
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
        <h3>Tambah Pelanggan</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* ── DATA PELANGGAN ── */}

          {/* Nama */}
          <div>
            <label>Nama</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Ucup Sarucup"
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
            {errors.gender && <span className="error">{errors.gender}</span>}
          </div>

          {/* Nomor HP */}
          <div>
            <label>Nomor HP</label>
            <input
              type="text"
              value={noHp}
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
            {errors.alamat && <span className="error">{errors.alamat}</span>}
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

          {/* ── DATA AKUN ── */}

          {/* Username */}
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: ucup123"
              className={errors.username && "input-error"}
              required
            />
            {errors.username && (
              <span className="error">{errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: ucup@email.com"
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
              className={errors.password && "input-error"}
              required
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          {/* Gambar */}
          <div>
            <label>
              Foto{" "}
              <span style={{ color: "#aaa", fontSize: 12 }}>(opsional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleGambarChange}
              // ← tidak ada required
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ width: 120, marginTop: 10 }}
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

export default AddPelanggan;
