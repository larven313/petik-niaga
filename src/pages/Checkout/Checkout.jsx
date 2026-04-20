// Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.jsx";
import { jwtDecode } from "jwt-decode";
import "./Checkout.css";

const BASE_URL = import.meta.env.VITE_API_URL;
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const Checkout = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { state } = useLocation();

  const isCart = !!state?.cart;
  const cartItems = state?.cart || [];

  // Decode user dari token
  const token = localStorage.getItem("token");
  const userToken = token ? jwtDecode(token) : null;
  const isAdmin =
    userToken?.role === "admin" || userToken?.role === "superadmin";

  const [produk, setProduk] = useState(null);
  const [pelanggan, setPelanggan] = useState(null); // ← data pelanggan yg login
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    const init = async () => {
      await getPelangganLogin();
      if (!isCart) await getProduk();
      setPageLoading(false);
    };
    init();
  }, []);

  const getProduk = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/produk/${uuid}`);
      setProduk(response.data.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  const getPelangganLogin = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/pelanggan`);
      const semua = response.data.data;
      // Cari pelanggan yang user_id-nya cocok dengan userId di token
      const data = semua.find((p) => p.user_id === userToken?.userId);
      setPelanggan(data || null);
    } catch (error) {
      console.log(error.response);
    }
  };

  const totalHarga = isCart
    ? cartItems.reduce((sum, item) => sum + item.harga * item.qty, 0)
    : produk
      ? produk.harga * qty
      : 0;

  const handleLanjutPembayaran = (e) => {
    e.preventDefault();
    setErrors({});

    if (!isCart && qty > produk.stok) {
      setErrors({ qty: `Stok tersedia hanya ${produk.stok}` });
      return;
    }

    setStep(2);
  };

  const handleBayar = async () => {
    setLoading(true);
    setErrors({});

    try {
      // 1. Buat pesanan
      const resPesanan = await axiosInstance.post(`${BASE_URL}/pesanan`, {
        tanggal: new Date().toISOString().split("T")[0],
        pelanggan_id: pelanggan.id,
        total: totalHarga,
      });

      const pesananId = resPesanan.data.data.id;

      // 2. Buat item pesanan
      if (isCart) {
        await Promise.all(
          cartItems.map((item) =>
            axiosInstance.post(`${BASE_URL}/pesanan-items`, {
              pesanan_id: pesananId,
              barang_id: item.id,
              qty: item.qty,
              harga: item.harga,
            }),
          ),
        );
      } else {
        await axiosInstance.post(`${BASE_URL}/pesanan-items`, {
          pesanan_id: pesananId,
          barang_id: produk.id,
          qty,
          harga: produk.harga,
        });
      }

      // 3. Ambil snap token
      const resSnap = await axiosInstance.post(
        `${BASE_URL}/midtrans/snap-token`,
        {
          pesanan_id: pesananId,
          total: totalHarga,
          pelanggan: { nama: pelanggan.nama, no_hp: pelanggan.no_hp },
          finish_url: `${FRONTEND_URL}/checkout/selesai`,
          error_url: `${FRONTEND_URL}/checkout/gagal`,
          cancel_url: `${FRONTEND_URL}/checkout/batal`,
        },
      );

      const snapToken = resSnap.data.data.token;
      setLoading(false);

      // 4. Buka popup Midtrans
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          navigate(
            `/checkout/selesai?order_id=${result.order_id}&transaction_status=${result.transaction_status}&pesanan_id=${pesananId}&total=${totalHarga}`,
          );
        },
        onPending: (result) => {
          navigate(
            `/checkout/selesai?order_id=${result.order_id}&transaction_status=${result.transaction_status}&pesanan_id=${pesananId}&total=${totalHarga}`,
          );
        },
        onError: (result) => {
          console.error("Midtrans error:", result);
          setErrors({ umum: "Pembayaran gagal. Silakan coba lagi." });
        },
        onClose: () => {
          setErrors({ umum: "Pembayaran dibatalkan. Silakan coba lagi." });
        },
      });
    } catch (err) {
      setLoading(false);
      setErrors({
        umum: err.response?.data?.msg || "Gagal memproses pembayaran",
      });
    }
  };

  // ── GUARD: admin tidak bisa checkout ──
  if (!pageLoading && isAdmin)
    return (
      <div className="checkout-center">
        <div className="checkout-result-card">
          <div className="checkout-result-icon">🚫</div>
          <h2>Akses Ditolak</h2>
          <p>Admin tidak dapat melakukan pembelian</p>
          <button
            className="checkout-btn-primary"
            onClick={() => navigate("/")}
          >
            Kembali
          </button>
        </div>
      </div>
    );

  // ── GUARD: user login tapi bukan pelanggan terdaftar ──
  if (!pageLoading && !pelanggan)
    return (
      <div className="checkout-center">
        <div className="checkout-result-card">
          <div className="checkout-result-icon">⚠️</div>
          <h2>Akun Tidak Terdaftar</h2>
          <p>Akun kamu belum terdaftar sebagai pelanggan</p>
          <button
            className="checkout-btn-primary"
            onClick={() => navigate("/")}
          >
            Kembali
          </button>
        </div>
      </div>
    );

  if (pageLoading) return <div className="checkout-loading">Memuat...</div>;
  if (!isCart && !produk)
    return <div className="checkout-loading">Produk tidak ditemukan</div>;
  if (!isCart && produk.stok === 0)
    return (
      <div className="checkout-center">
        <div className="checkout-result-card">
          <div className="checkout-result-icon">😔</div>
          <h2>Stok Habis</h2>
          <p>
            Maaf, produk <strong>{produk.nama_barang}</strong> sedang tidak
            tersedia
          </p>
          <button
            className="checkout-btn-primary"
            onClick={() => navigate("/")}
          >
            Kembali Belanja
          </button>
        </div>
      </div>
    );

  return (
    <div className="checkout-page">
      {/* ── NAVBAR ── */}
      <nav className="checkout-navbar">
        <button
          onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}
          className="checkout-back"
        >
          ← {step === 1 ? "Kembali" : "Sebelumnya"}
        </button>
        <h3>Checkout</h3>
        <div />
      </nav>

      {/* ── PROGRESS STEP ── */}
      <div className="checkout-steps">
        {["Informasi", "Pembayaran", "Selesai"].map((label, i) => (
          <div
            key={i}
            className={`checkout-step ${step >= i + 1 ? "active" : ""}`}
          >
            <div className="checkout-step-circle">{i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="checkout-container">
        {/* ── DETAIL PRODUK / CART ── */}
        <div className="checkout-card">
          <h4 className="checkout-card-title">
            {isCart
              ? `Keranjang (${cartItems.length} produk)`
              : "Detail Produk"}
          </h4>

          {isCart ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="checkout-produk"
                style={{ marginBottom: 12 }}
              >
                <div className="checkout-produk-img">
                  {item.url ? (
                    <img src={item.url} alt={item.nama_barang} />
                  ) : (
                    <span>🛍️</span>
                  )}
                </div>
                <div className="checkout-produk-info">
                  <h4 className="checkout-produk-nama">{item.nama_barang}</h4>
                  <p className="checkout-produk-harga">
                    Rp {Number(item.harga).toLocaleString("id-ID")}
                  </p>
                  <p className="checkout-produk-stok">Qty: {item.qty}</p>
                </div>
                <p style={{ fontWeight: 700, color: "#295f98", fontSize: 14 }}>
                  Rp {Number(item.harga * item.qty).toLocaleString("id-ID")}
                </p>
              </div>
            ))
          ) : (
            <div className="checkout-produk">
              <div className="checkout-produk-img">
                {produk.url ? (
                  <img src={produk.url} alt={produk.nama_barang} />
                ) : (
                  <span>🛍️</span>
                )}
              </div>
              <div className="checkout-produk-info">
                <p className="checkout-produk-kategori">
                  {produk.jenis_produk?.nama || "Umum"}
                </p>
                <h4 className="checkout-produk-nama">{produk.nama_barang}</h4>
                <p className="checkout-produk-harga">
                  Rp {Number(produk.harga).toLocaleString("id-ID")}
                </p>
                <p className="checkout-produk-stok">Stok: {produk.stok}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── STEP 1: FORM INFORMASI ── */}
        {step === 1 && (
          <form onSubmit={handleLanjutPembayaran} className="checkout-card">
            <h4 className="checkout-card-title">Informasi Pembelian</h4>

            {/* Info pelanggan yang login — read only */}
            <div className="checkout-field">
              <label>Pembeli</label>
              <div className="checkout-pelanggan-info">
                <p className="checkout-pelanggan-nama">{pelanggan.nama}</p>
                <p className="checkout-pelanggan-hp">{pelanggan.no_hp}</p>
              </div>
            </div>

            {/* Qty hanya untuk beli langsung */}
            {!isCart && (
              <div className="checkout-field">
                <label>Jumlah</label>
                <div className="checkout-qty">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="checkout-qty-input"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(produk.stok, q + 1))}
                  >
                    +
                  </button>
                </div>
                {errors.qty && (
                  <span className="checkout-error">{errors.qty}</span>
                )}
              </div>
            )}

            {/* Ringkasan */}
            <div className="checkout-ringkasan">
              {isCart ? (
                cartItems.map((item) => (
                  <div key={item.id} className="checkout-ringkasan-row">
                    <span>
                      {item.nama_barang} ×{item.qty}
                    </span>
                    <span>
                      Rp {Number(item.harga * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="checkout-ringkasan-row">
                    <span>Harga satuan</span>
                    <span>
                      Rp {Number(produk.harga).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="checkout-ringkasan-row">
                    <span>Jumlah</span>
                    <span>{qty}</span>
                  </div>
                </>
              )}
              <div className="checkout-ringkasan-row checkout-ringkasan-total">
                <span>Total</span>
                <span>Rp {Number(totalHarga).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button type="submit" className="checkout-btn-primary">
              Lanjut ke Pembayaran →
            </button>
          </form>
        )}

        {/* ── STEP 2: KONFIRMASI PEMBAYARAN ── */}
        {step === 2 && (
          <div className="checkout-card">
            <h4 className="checkout-card-title">Konfirmasi Pembayaran</h4>

            <div className="checkout-ringkasan" style={{ marginBottom: 20 }}>
              <div className="checkout-ringkasan-row">
                <span>Pembeli</span>
                <span>{pelanggan.nama}</span>
              </div>
              {isCart ? (
                cartItems.map((item) => (
                  <div key={item.id} className="checkout-ringkasan-row">
                    <span>
                      {item.nama_barang} ×{item.qty}
                    </span>
                    <span>
                      Rp {Number(item.harga * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="checkout-ringkasan-row">
                    <span>Produk</span>
                    <span>{produk.nama_barang}</span>
                  </div>
                  <div className="checkout-ringkasan-row">
                    <span>Qty</span>
                    <span>{qty}</span>
                  </div>
                </>
              )}
              <div className="checkout-ringkasan-row checkout-ringkasan-total">
                <span>Total Bayar</span>
                <span>Rp {Number(totalHarga).toLocaleString("id-ID")}</span>
              </div>
            </div>

            {errors.umum && (
              <span
                className="checkout-error"
                style={{ marginBottom: 12, display: "block" }}
              >
                {errors.umum}
              </span>
            )}

            <div className="checkout-midtrans-info">
              <span>🔒</span>
              <span>
                Pilih metode pembayaran via <strong>Midtrans</strong> di langkah
                berikutnya
              </span>
            </div>

            <button
              className="checkout-btn-primary"
              onClick={handleBayar}
              disabled={loading}
            >
              {loading
                ? "⏳ Menyiapkan pembayaran..."
                : `Bayar Rp ${Number(totalHarga).toLocaleString("id-ID")}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
