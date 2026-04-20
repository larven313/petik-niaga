// CheckoutSelesai.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Checkout.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const STATUS_MAP = {
  settlement: { icon: "✅", judul: "Pembayaran Berhasil!" },
  pending: { icon: "⏳", judul: "Menunggu Pembayaran" },
  deny: { icon: "❌", judul: "Pembayaran Ditolak" },
  expire: { icon: "⌛", judul: "Pembayaran Expired" },
  cancel: { icon: "🚫", judul: "Pembayaran Dibatalkan" },
};

const CheckoutSelesai = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const orderId = params.get("order_id") || "";
  const transactionStatus = params.get("transaction_status") || "settlement";

  const [pesanan, setPesanan] = useState(null); // ← object, bukan array
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const pesananId = orderId.split("-")[1];
    if (!pesananId) return;
    fetchDetail(pesananId);
  }, [orderId]);

  const fetchDetail = async (pesananId) => {
    try {
      // Ambil pesanan → cari by id → simpan sebagai object
      const resPesanan = await axios.get(`${BASE_URL}/pesanan`);
      const dataPesanan = resPesanan.data.data.find(
        (p) => p.id == pesananId, // ← find bukan filter, hasilnya object
      );
      setPesanan(dataPesanan);

      // Ambil items → filter by pesanan_id
      const resItems = await axios.get(`${BASE_URL}/pesanan-items`);
      const dataItems = resItems.data.data.filter(
        (p) => p.pesanan_id == pesananId,
      );
      setItems(dataItems);
    } catch (err) {
      console.error("Gagal fetch detail pesanan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hitung subtotal per item dan total keseluruhan
  const totalBayar = items.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0,
  );

  const { icon, judul } =
    STATUS_MAP[transactionStatus] ?? STATUS_MAP.settlement;

  if (loading) return <div className="checkout-loading">Memuat...</div>;

  return (
    <div className="checkout-center">
      <div className="checkout-result-card">
        <div className="checkout-result-icon">{icon}</div>
        <h2>{judul}</h2>
        <p>Terima kasih telah berbelanja di Petik Niaga</p>

        <div className="checkout-result-info">
          {/* Info pesanan */}
          <div className="checkout-result-row">
            <span>No. Pesanan</span>
            <span>#{orderId}</span>
          </div>
          <div className="checkout-result-row">
            <span>Pelanggan</span>
            <span>{pesanan?.pelanggan?.nama ?? "-"}</span>
          </div>
          <div className="checkout-result-row">
            <span>Tanggal</span>
            <span>
              {pesanan?.tanggal
                ? new Date(pesanan.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>

          {/* Garis pemisah */}
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />

          {/* Item yang dibeli + subtotal per item */}
          {items.map((item) => (
            <div key={item.id} className="checkout-result-row">
              <span>
                {item.produk?.nama_barang ?? "Produk"}
                <br />
                <small style={{ color: "#888" }}>
                  {item.qty}x Rp {Number(item.harga).toLocaleString("id-ID")}
                </small>
              </span>
              <span style={{ fontWeight: 600 }}>
                Rp {Number(item.harga * item.qty).toLocaleString("id-ID")}
              </span>
            </div>
          ))}

          {/* Garis pemisah sebelum total */}
          <div style={{ borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />

          {/* Total bayar */}
          <div className="checkout-result-row checkout-result-total">
            <span>Total Bayar</span>
            <span>Rp {Number(totalBayar).toLocaleString("id-ID")}</span>
          </div>
        </div>

        {transactionStatus === "pending" && (
          <div className="checkout-midtrans-info" style={{ marginBottom: 16 }}>
            <span>ℹ️</span>
            <span>Selesaikan pembayaran sesuai metode yang dipilih</span>
          </div>
        )}

        <button className="checkout-btn-primary" onClick={() => navigate("/")}>
          Kembali Belanja
        </button>
      </div>
    </div>
  );
};

export default CheckoutSelesai;
