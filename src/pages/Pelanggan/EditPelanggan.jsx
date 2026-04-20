import axiosInstance from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Pelanggan.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const EditPelanggan = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();

  // ── State data pelanggan ──
  const [nama, setNama] = useState("");
  const [gender, setGender] = useState("L");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [kartuId, setKartuId] = useState("");

  // ── State data akun user ──
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // ← kosong = tidak ganti password
  const [status, setStatus] = useState("aktif");
  const [userUuid, setUserUuid] = useState(""); // ← uuid user untuk PUT /users/:uuid

  // ── State gambar ──
  const [gambarBaru, setGambarBaru] = useState(null);
  const [preview, setPreview] = useState(null);

  // ── State UI ──
  const [kartuList, setKartuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getPelangganByID();
    getKartuList();
  }, []);

  // Ambil data pelanggan + data user yang terhubung
  const getPelangganByID = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/pelanggan/${uuid}`);
      const data = response.data.data;

      // Isi form dengan data pelanggan lama
      setNama(data.nama);
      setGender(data.gender);
      setNoHp(data.no_hp);
      setAlamat(data.alamat);
      setTglLahir(data.tgl_lahir?.split("T")[0]); // "2024-06-25T00:00:00" → "2024-06-25"
      setKartuId(data.kartu_id);
      if (data.user) {
        console.log("user uuid:", data.user.uuid); // ← cek apakah sudah ada
        setUserUuid(data.user.uuid);
      }

      // Isi form dengan data akun user lama (kalau ada)
      if (data.user) {
        setUsername(data.user.username);
        setEmail(data.user.email || "");
        setStatus(data.user.status);
        setUserUuid(data.user.uuid);
        setPreview(data.user.url); // ← tampilkan foto lama
      }
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Ambil daftar kartu membership
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
    setGambarBaru(file);
    setPreview(URL.createObjectURL(file)); // ← preview foto baru
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // ── STEP 1: Update akun user (kalau ada userUuid) ──
      if (userUuid) {
        const userFormData = new FormData();
        userFormData.append("username", username);
        userFormData.append("email", email);
        userFormData.append("status", status);
        if (password) userFormData.append("password", password); // ← hanya kirim kalau diisi
        if (gambarBaru) userFormData.append("gambar", gambarBaru);

        await axiosInstance.put(`${BASE_URL}/users/${userUuid}`, userFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // ── STEP 2: Update data pelanggan ──
      const pelangganFormData = new FormData();
      pelangganFormData.append("nama", nama);
      pelangganFormData.append("gender", gender);
      pelangganFormData.append("no_hp", noHp);
      pelangganFormData.append("alamat", alamat);
      pelangganFormData.append("tgl_lahir", tglLahir);
      pelangganFormData.append("kartu_id", kartuId);

      await axiosInstance.put(
        `${BASE_URL}/pelanggan/${uuid}`,
        pelangganFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      navigate(-1);
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [];

      if (apiErrors.length > 0) {
        // Error validasi field → tampil di bawah input masing-masing
        const errorPerField = {};
        apiErrors.forEach((e) => {
          errorPerField[e.path] = e.msg;
        });
        setErrors(errorPerField);
      } else {
        // Error umum
        setErrors({ umum: err.response?.data?.msg || "Gagal menyimpan" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Edit Pelanggan</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* ════════════════════════════
              DATA PELANGGAN
          ════════════════════════════ */}

          {/* Nama */}
          <div>
            <label>Nama</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
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
              className={errors.password && "input-error"}
              placeholder="••••••"
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          {/* Status Akun */}
          <div>
            <label>Status Akun</label>
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

export default EditPelanggan;
