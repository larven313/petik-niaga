import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Kategori.css";

const AddKategori = () => {
  const navigate = useNavigate();

  // State untuk menyimpan input form
  const [namaKategori, setNamaKategori] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fungsi saat form disubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Buat FormData karena ada file gambar
      const formData = new FormData();
      formData.append("nama", namaKategori);
      if (gambar) {
        formData.append("gambar", gambar);
      }

      // Kirim data ke API
      await axios.post(
        `${import.meta.env.VITE_API_URL}/jenis-produk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Kalau berhasil, kembali ke halaman sebelumnya
      // navigate("/dashboard/kategori");
      navigate(-1);
    } catch (err) {
      // Ubah array errors dari API jadi object { nama: "...", gambar: "..." }
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

  const handleChangeGambar = (e) => {
    const file = e.target.files[0];
    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Tambah Kategori</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* Input Nama Kategori */}
          <div>
            <label htmlFor="nama">Nama Kategori</label>
            <input
              type="text"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              placeholder="Contoh: Elektronik"
              className={errors.nama && `input-error`}
              id="nama"
              required
            />
            {errors.nama && <span className="error">{errors.nama}</span>}
          </div>

          {/* Input Gambar */}
          <div>
            <label>Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleChangeGambar}
              className={errors.umum && `input-error`}
            />
            {preview && (
              <img src={preview} alt="gambar-preview" width="220px" />
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

export default AddKategori;
