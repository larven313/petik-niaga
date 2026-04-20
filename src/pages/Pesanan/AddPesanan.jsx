import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const BASE_URL = import.meta.env.VITE_API_URL;

const AddPesanan = () => {
  const navigate = useNavigate();

  // State form pesanan
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [pelangganId, setPelangganId] = useState("");

  // State items pesanan
  const [items, setItems] = useState([
    { barang_id: "", harga: 0, qty: 1 }, // ← satu item kosong di awal
  ]);

  // State UI
  const [pelangganList, setPelangganList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getPelangganList();
    getBarangList();
  }, []);

  const getPelangganList = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/pelanggan`);
      setPelangganList(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBarangList = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/produk`);
      setBarangList(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Tambah baris item baru
  const handleTambahItem = () => {
    setItems([...items, { barang_id: "", harga: 0, qty: 1 }]);
  };

  // Hapus baris item
  const handleHapusItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update salah satu field di item tertentu
  const handleItemChange = (index, field, value) => {
    const updated = [...items];

    if (field === "barang_id") {
      // Kalau ganti barang, otomatis isi harga dari data barang
      const barang = barangList.find((b) => b.id === Number(value));
      updated[index].barang_id = value;
      updated[index].harga = barang?.harga || 0;
    } else {
      updated[index][field] = value;
    }

    setItems(updated);
  };

  // Hitung total semua item
  const total = items.reduce((sum, item) => {
    return sum + item.harga * item.qty;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validasi minimal 1 item
    if (items.length === 0 || items.some((item) => !item.barang_id)) {
      setErrors({ umum: "Harap pilih barang untuk semua item" });
      setLoading(false);
      return;
    }

    try {
      // ── STEP 1: Buat pesanan ──
      const pesananResponse = await axiosInstance.post(`${BASE_URL}/pesanan`, {
        tanggal,
        pelanggan_id: pelangganId,
        total,
      });

      const pesananId = pesananResponse.data.data.id;

      // ── STEP 2: Buat semua item pesanan ──
      await Promise.all(
        items.map((item) =>
          axiosInstance.post(`${BASE_URL}/pesanan-items`, {
            pesanan_id: pesananId,
            barang_id: item.barang_id,
            qty: item.qty,
            harga: item.harga,
          }),
        ),
      );

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
        <h3>Tambah Pesanan</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-grid">
          {/* Tanggal */}
          <div>
            <label>Tanggal</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className={errors.tanggal && "input-error"}
              required
            />
            {errors.tanggal && <span className="error">{errors.tanggal}</span>}
          </div>

          {/* Pelanggan */}
          <div>
            <label>Pelanggan</label>
            <select
              value={pelangganId}
              onChange={(e) => setPelangganId(e.target.value)}
              className={errors.pelanggan_id && "input-error"}
              required
            >
              <option value="" disabled>
                - Pilih Pelanggan -
              </option>
              {pelangganList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — {p.no_hp}
                </option>
              ))}
            </select>
            {errors.pelanggan_id && (
              <span className="error">{errors.pelanggan_id}</span>
            )}
          </div>

          {/* ── TABEL ITEM PESANAN ── */}
          <div className="form-full">
            <label>Item Pesanan</label>
            <table className="table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Harga</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    {/* Pilih Barang */}
                    <td>
                      <select
                        value={item.barang_id}
                        onChange={(e) =>
                          handleItemChange(index, "barang_id", e.target.value)
                        }
                        required
                      >
                        <option value="" disabled>
                          - Pilih -
                        </option>
                        {barangList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nama_barang}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Harga otomatis dari barang */}
                    <td>Rp {Number(item.harga).toLocaleString("id-ID")}</td>

                    {/* Qty */}
                    <td>
                      <input
                        type="number"
                        value={item.qty}
                        min={1}
                        onChange={(e) =>
                          handleItemChange(index, "qty", Number(e.target.value))
                        }
                        style={{ width: 60 }}
                        required
                      />
                    </td>

                    {/* Subtotal */}
                    <td>
                      Rp {Number(item.harga * item.qty).toLocaleString("id-ID")}
                    </td>

                    {/* Hapus item */}
                    <td>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleHapusItem(index)}
                          className="btn-delete"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tambah item */}
            <button
              type="button"
              onClick={handleTambahItem}
              className="btn-edit"
              style={{ marginTop: 8 }}
            >
              + Tambah Item
            </button>
          </div>

          {/* Total */}
          <div
            className="form-full"
            style={{ textAlign: "right", fontWeight: "bold", fontSize: 16 }}
          >
            Total: Rp {Number(total).toLocaleString("id-ID")}
          </div>

          {/* Error umum */}
          {errors.umum && (
            <div className="form-full">
              <span className="error">{errors.umum}</span>
            </div>
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

export default AddPesanan;
