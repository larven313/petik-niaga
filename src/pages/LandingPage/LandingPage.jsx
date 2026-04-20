// LandingPage.jsx
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./LandingPage.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const BASE_URL = import.meta.env.VITE_API_URL;

const LandingPage = () => {
  const [produkList, setProdukList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState("semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getProduk();
    getKategori();
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded);
        console.log(decoded);
      }
    } catch (err) {
      console.error("Token tidak valid:", err);
    }
  }, []);

  const getProduk = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/produk`);
      setProdukList(response.data.data);
    } catch (error) {
      console.log(error?.response);
    } finally {
      setLoading(false);
    }
  };

  const getKategori = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/jenis-produk`);
      setKategoriList(response.data.data);
    } catch (error) {
      console.log(error?.response);
    }
  };

  // Tambah ke cart
  const handleTambahCart = (produk) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === produk.id);
      if (exist) {
        return prev.map((item) =>
          item.id === produk.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...produk, qty: 1 }];
    });
  };

  // Kurangi qty
  const handleKurangiCart = (id) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === id);
      if (exist.qty === 1) return prev.filter((item) => item.id !== id);
      return prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item,
      );
    });
  };

  const handleBeli = (uuid) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); // ← belum login → ke halaman login
      return;
    }

    navigate(`/checkout/${uuid}`);
  };

  // Hapus dari cart
  const handleHapusCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Total item di cart
  const totalQtyCart = cart.reduce((sum, item) => sum + item.qty, 0);

  // Total harga cart
  const totalHargaCart = cart.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0,
  );

  const filteredProduk = produkList.filter((p) => {
    const matchKategori =
      selectedKategori === "semua" ||
      p.jenis_produk_id === Number(selectedKategori);
    const matchSearch = p.nama_barang
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchKategori && matchSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="landing-page">
      {/* ── NAVBAR ── */}
      <nav className="landing-navbar">
        <div className="landing-navbar-left">
          <button
            className="landing-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <NavLink to={"/"} className="landing-logo">
            <div className="landing-logo-icon">P</div>
            <h3>Petik Niaga</h3>
          </NavLink>
          <div className="landing-menu-desktop">
            {["Beranda", "Produk", "Tentang", "Kontak"].map((menu) => (
              <a
                key={menu}
                href={`#${menu.toLowerCase()}`}
                className="landing-menu-link"
              >
                {menu}
              </a>
            ))}
          </div>
        </div>

        <div className="landing-search-wrapper landing-desktop-only">
          <span>🔍</span>
          <input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="landing-navbar-right">
          {/* Tombol cart */}
          <button
            className="landing-cart-btn"
            onClick={() => setCartOpen(true)}
          >
            🛒
            {totalQtyCart > 0 && (
              <span className="landing-cart-badge">{totalQtyCart}</span>
            )}
          </button>
          {user ? (
            <button className="landing-btn-login" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <a href="/login" className="landing-btn-login">
              Masuk
            </a>
          )}
        </div>

        <div className="landing-search-wrapper landing-mobile-only">
          <span>🔍</span>
          <input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <>
          <div className="landing-overlay" onClick={() => setMenuOpen(false)} />
          <div className="landing-mobile-menu">
            <div className="landing-logo" style={{ marginBottom: 24 }}>
              <div className="landing-logo-icon">P</div>
              <h3>Petik Niaga</h3>
            </div>
            {["Beranda", "Produk", "Tentang", "Kontak"].map((menu) => (
              <a
                key={menu}
                href={`#${menu.toLowerCase()}`}
                className="landing-mobile-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                {menu}
              </a>
            ))}
          </div>
        </>
      )}

      {/* ── CART SIDEBAR ── */}
      {cartOpen && (
        <>
          <div className="landing-overlay" onClick={() => setCartOpen(false)} />
          <div className="landing-cart-sidebar">
            {/* Header */}
            <div className="landing-cart-header">
              <h3>🛒 Keranjang ({totalQtyCart})</h3>
              <button
                className="landing-cart-close"
                onClick={() => setCartOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* List item */}
            <div className="landing-cart-items">
              {cart.length === 0 ? (
                <div className="landing-cart-empty">Keranjang masih kosong</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="landing-cart-item">
                    <div className="landing-cart-item-img">
                      {item.url ? (
                        <img src={item.url} alt={item.nama_barang} />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </div>
                    <div className="landing-cart-item-info">
                      <p className="landing-cart-item-nama">
                        {item.nama_barang}
                      </p>
                      <p className="landing-cart-item-harga">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </p>
                      <div className="landing-cart-item-qty">
                        <button onClick={() => handleKurangiCart(item.id)}>
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => handleTambahCart(item)}>
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="landing-cart-item-hapus"
                      onClick={() => handleHapusCart(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer cart */}
            {cart.length > 0 && (
              <div className="landing-cart-footer">
                <div className="landing-cart-total">
                  <span>Total</span>
                  <span>
                    Rp {Number(totalHargaCart).toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  className="landing-btn-checkout"
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/checkout/cart", { state: { cart } });
                  }}
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HERO ── */}
      <section id="beranda" className="landing-hero">
        <h1>Belanja Mudah, Harga Terbaik</h1>
        <p>Temukan berbagai produk berkualitas di Petik Niaga</p>
        <a href="#produk" className="landing-btn-hero">
          Lihat Produk
        </a>
      </section>

      {/* ── FILTER KATEGORI ── */}
      <section id="produk" className="landing-section">
        <h3 className="landing-section-title">Kategori</h3>
        <div className="landing-kategori-list">
          <button
            onClick={() => setSelectedKategori("semua")}
            className={`landing-kategori-btn ${selectedKategori === "semua" ? "active" : ""}`}
          >
            Semua
          </button>
          {kategoriList.map((k) => (
            <button
              key={k.id}
              onClick={() => setSelectedKategori(String(k.id))}
              className={`landing-kategori-btn ${selectedKategori === String(k.id) ? "active" : ""}`}
            >
              {k.nama}
            </button>
          ))}
        </div>
      </section>

      {/* ── DAFTAR PRODUK ── */}
      <section className="landing-section">
        {loading ? (
          <div className="landing-empty">Memuat produk...</div>
        ) : filteredProduk.length === 0 ? (
          <div className="landing-empty">Produk tidak ditemukan</div>
        ) : (
          <div className="landing-produk-grid">
            {filteredProduk.map((produk) => (
              <div key={produk.id} className="landing-produk-card">
                <div className="landing-produk-img">
                  {produk.url ? (
                    <img src={produk.url} alt={produk.nama_barang} />
                  ) : (
                    <span>🛍️</span>
                  )}
                </div>
                <div className="landing-produk-info">
                  <p className="landing-produk-kategori">
                    {produk.jenis_produk?.nama || "Umum"}
                  </p>
                  <h4 className="landing-produk-nama">{produk.nama_barang}</h4>
                  <p className="landing-produk-stok">Stok: {produk.stok}</p>
                  <p className="landing-produk-harga">
                    Rp {Number(produk.harga).toLocaleString("id-ID")}
                  </p>
                  <div className="landing-produk-btn-group">
                    <button
                      className="landing-btn-keranjang"
                      onClick={() => handleTambahCart(produk)}
                      disabled={produk.stok === 0}
                    >
                      + Keranjang
                    </button>
                    <button
                      className="landing-btn-beli"
                      onClick={() => handleBeli(produk.uuid)}
                      disabled={produk.stok === 0}
                    >
                      {produk.stok === 0 ? "Habis" : "Beli"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <h3>Petik Niaga</h3>
        <p>Belanja mudah, harga terbaik, pengiriman cepat</p>
        <small>© 2026 Petik Niaga. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default LandingPage;
