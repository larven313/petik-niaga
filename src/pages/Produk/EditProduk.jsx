import axiosInstance from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AddProduk.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const EditProduk = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();

  // State form
  const [barang, setBarang] = useState("");
  const [stok, setStok] = useState(0);
  const [minStok, setMinStok] = useState(0);
  const [harga, setHarga] = useState(0);
  const [kategori, setKategori] = useState("");
  const [gambarBaru, setGambarBaru] = useState(null); // ← file baru kalau user ganti gambar
  const [preview, setPreview] = useState(null); // ← preview gambar lama atau baru

  // State UI
  const [jenisProdukList, setJenisProdukList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Ambil data produk + daftar kategori saat halaman dibuka
  useEffect(() => {
    getProdukByID();
    getKategoriList();
  }, []);

  const getProdukByID = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/produk/${uuid}`);
      const data = response.data.data;

      // Isi form dengan data lama
      setBarang(data.nama_barang);
      setStok(data.stok);
      setMinStok(data.min_stok);
      setHarga(data.harga);
      setKategori(data.jenis_produk_id);
      setPreview(data.url); // ← tampilkan gambar lama sebagai preview
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getKategoriList = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/jenis-produk`);
      setJenisProdukList(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGambarChange = (e) => {
    const file = e.target.files[0];
    setGambarBaru(file);
    setPreview(URL.createObjectURL(file)); // ← ganti preview dengan gambar baru
  };

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
      if (gambarBaru) formData.append("gambar", gambarBaru); // ← hanya kirim kalau ada gambar baru

      await axiosInstance.put(`${BASE_URL}/produk/${uuid}`, formData, {
        // ← fix: /produk bukan /jenis-produk
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

  const handleHargaChange = (e) => {
    const angkaBersih = e.target.value.replace(/\./g, "").replace(/\D/g, ""); // ← hapus titik dulu, baru hapus non-angka
    setHarga(angkaBersih);
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Edit Produk</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* Nama Produk */}
          <div>
            <label>Nama Barang</label>
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

export default EditProduk;
