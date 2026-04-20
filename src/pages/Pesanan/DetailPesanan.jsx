import axiosInstance from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Pesanan.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const DetailPesanan = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();

  const [pesanan, setPesanan] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPesananByID();
  }, []);

  const getPesananByID = async () => {
    setLoading(true);
    try {
      // Ambil data pesanan by uuid
      const resPesanan = await axiosInstance.get(`${BASE_URL}/pesanan/${uuid}`);
      const data = resPesanan.data.data;
      console.log(resPesanan.data.data);

      setPesanan(data);

      // Ambil semua items lalu filter by pesanan_id
      const resItems = await axiosInstance.get(`${BASE_URL}/pesanan-items`);
      const filtered = resItems.data.data.filter(
        (item) => item.pesanan_id === data.id, // ← filter by pesanan_id
      );
      setItems(filtered);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Memuat data...</div>;
  if (!pesanan) return <div style={{ padding: 24 }}>Data tidak ditemukan</div>;

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Detail Pesanan</h3>
        <button onClick={() => navigate(-1)} className="btn-delete">
          Kembali
        </button>
      </div>

      {/* ── INFO PESANAN ── */}
      <div className="form-wrapper" style={{ marginBottom: 24 }}>
        <table className="table">
          <tbody>
            <tr>
              <td style={{ fontWeight: "bold", width: 150 }}>Pelanggan</td>
              <td>{pesanan.pelanggan?.nama || "-"}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold" }}>No HP</td>
              <td>{pesanan.pelanggan?.no_hp || "-"}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold" }}>Tanggal</td>
              <td>
                {new Date(pesanan.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold" }}>Total</td>
              <td style={{ fontWeight: "bold", color: "green" }}>
                Rp {Number(pesanan.total).toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── ITEM PESANAN ── */}
      <h4 style={{ marginBottom: 8 }}>Item Pesanan</h4>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Barang</th>
              <th>Harga</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  align="center"
                  style={{ padding: "2rem", color: "red" }}
                >
                  Tidak ada item
                </td>
              </tr>
            ) : (
              <>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td align="center">{index + 1}</td>
                    <td>{item.produk?.nama_barang || "-"}</td>
                    {/* ← pakai produk bukan barang */}
                    <td>Rp {Number(item.harga).toLocaleString("id-ID")}</td>
                    <td align="center">{item.qty}</td>
                    <td>
                      Rp {Number(item.harga * item.qty).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}

                {/* Baris total */}
                <tr>
                  <td colSpan={4} align="right" style={{ fontWeight: "bold" }}>
                    Total
                  </td>
                  <td style={{ fontWeight: "bold", color: "green" }}>
                    Rp {Number(pesanan.total).toLocaleString("id-ID")}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailPesanan;
