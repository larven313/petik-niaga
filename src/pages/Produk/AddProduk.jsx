import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "./AddProduk.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const AddProduk = () => {
  const navigate = useNavigate();

  // State untuk setiap input form
  const [barang, setBarang] = useState("");
  const [stok, setStok] = useState(0);
  const [minStok, setMinStok] = useState(0);
  const [harga, setHarga] = useState(0);
  const [kategori, setKategori] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);

  // State untuk UI
  const [jenisProdukList, setJenisProdukList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Ambil daftar kategori saat halaman dibuka
  useEffect(() => {
    getKategoriList();
  }, []);

  const getKategoriList = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/jenis-produk`);
      setJenisProdukList(response.data.data); // ← fix: sebelumnya setJenisProdukList(categories) tanpa .data.data
    } catch (error) {
      console.log(error);
    }
  };

  // Khusus input gambar: simpan file + buat preview
  const handleGambarChange = (e) => {
    const file = e.target.files[0];
    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  // Kirim data ke API saat form disubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("nama_barang", barang);
      formData.append("stok", stok);
      formData.append("min_stok", minStok);
      formData.append("harga", harga);
      formData.append("jenis_produk_id", kategori);
      if (gambar) formData.append("gambar", gambar);

      await axiosInstance.post(`${BASE_URL}/produk`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(-1); // ← kembali ke halaman sebelumnya
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
        // Error umum → tampil di bawah input gambar
        setErrors({ umum: err.response?.data?.msg || "Gagal menyimpan" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHargaChange = (e) => {
    const angkaBersih = e.target.value.replace(/\./g, "").replace(/\D/g, ""); // ← hapus titik dulu, baru hapus non-angka
    setHarga(angkaBersih);
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Tambah Produk</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* Nama Produk */}
          <div>
            <label>Nama Produk</label>
            <input
              type="text"
              value={barang}
              onChange={(e) => setBarang(e.target.value)}
              placeholder="Contoh: Laptop Asus"
              className={errors.nama_barang && "input-error"}
              required
            />
            {errors.nama_barang && (
              <span className="error">{errors.nama_barang}</span>
            )}
          </div>

          {/* Stok */}
          <div>
            <label>Stok</label>
            <input
              type="number"
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              className={errors.stok && "input-error"}
              required
            />
            {errors.stok && <span className="error">{errors.stok}</span>}
          </div>

          {/* Minimal Stok */}
          <div>
            <label>Minimal Stok</label>
            <input
              type="number"
              value={minStok}
              onChange={(e) => setMinStok(e.target.value)}
              className={errors.min_stok && "input-error"}
              required
            />
            {errors.min_stok && (
              <span className="error">{errors.min_stok}</span>
            )}
          </div>

          {/* Harga */}
          <div>
            <label>Harga</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rp</span>
              <input
                type="text"
                value={Number(harga).toLocaleString("id-ID")}
                onChange={handleHargaChange}
                placeholder="0"
                required
              />
            </div>
            {errors.harga && <span className="error">{errors.harga}</span>}
          </div>

          {/* Jenis Produk */}
          <div>
            <label>Jenis Produk</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className={errors.jenis_produk_id && "input-error"}
              required
            >
              <option value="" disabled>
                - Pilih -
              </option>
              {jenisProdukList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama}
                </option>
              ))}
            </select>
            {errors.jenis_produk_id && (
              <span className="error">{errors.jenis_produk_id}</span>
            )}
          </div>

          {/* Gambar */}
          <div>
            <label>Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleGambarChange}
              className={errors.umum && "input-error"}
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

export default AddProduk;
