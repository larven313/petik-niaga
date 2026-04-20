// Dashboard.jsx
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./Dashboard.css";
import {
  FaMoneyBillTrendUp,
  FaCartShopping,
  FaUserGroup,
  FaBox,
} from "react-icons/fa6";
import { TfiStatsUp } from "react-icons/tfi";
import { IoIosWarning } from "react-icons/io";

const BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [pesanan, setPesanan] = useState([]);
  const [produk, setProduk] = useState([]);
  const [pelanggan, setPelanggan] = useState([]);
  const [pesananItems, setPesananItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStokId, setEditStokId] = useState(null);
  const [stokTambah, setStokTambah] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resPesanan, resProduk, resPelanggan, resItems] = await Promise.all(
        [
          axiosInstance.get(`${BASE_URL}/pesanan`),
          axiosInstance.get(`${BASE_URL}/produk`),
          axiosInstance.get(`${BASE_URL}/pelanggan`),
          axiosInstance.get(`${BASE_URL}/pesanan-items`),
        ],
      );
      setPesanan(resPesanan.data.data);
      setProduk(resProduk.data.data);
      setPelanggan(resPelanggan.data.data);
      setPesananItems(resItems.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Hitung summary ──
  const today = new Date().toISOString().split("T")[0];
  const month = new Date().toISOString().slice(0, 7);

  const totalPendapatanHariIni = pesanan
    .filter((p) => p.tanggal === today)
    .reduce((sum, p) => sum + p.total, 0);

  const totalPendapatanBulanIni = pesanan
    .filter((p) => p.tanggal.startsWith(month))
    .reduce((sum, p) => sum + p.total, 0);

  const pesananHariIni = pesanan.filter((p) => p.tanggal === today);

  const produkMenipis = produk.filter((p) => p.stok <= p.min_stok);

  // ── Data grafik: pendapatan 7 hari terakhir ──
  const grafikData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); // pakai today sebagai referensi
    d.setDate(d.getDate() - (6 - i));

    // format tanggal jadi "9 April"
    const tgl = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
    });

    const pesananHari = pesanan.filter(
      (p) => p.tanggal === d.toISOString().split("T")[0],
    );

    return {
      tgl, // langsung "9 April"
      total: pesananHari.reduce((sum, p) => sum + p.total, 0),
      jumlah: pesananHari.length,
    };
  });

  // ── Pesanan terbaru (5 terakhir) ──
  const pesananTerbaru = [...pesanan]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const handleSimpanStok = async (produk) => {
    try {
      const tambahan = parseInt(stokTambah, 10);

      if (isNaN(tambahan)) {
        alert("Input tidak valid!");
      }
      const newStok = produk.stok + tambahan;

      console.log(typeof newStok);

      await axiosInstance.put(
        `${import.meta.env.VITE_API_URL}/produk/${produk.uuid}`,
        {
          stok: Number(newStok),
        },
      );
      setEditStokId(null);
      setStokTambah(0);
      fetchAll();
      console.log(newStok);
    } catch (error) {
      console.log(error.response);
    }
  };

  if (loading) return <div className="dashboard-loading">Memuat data...</div>;

  return (
    <div className="dashboard-page">
      <h3>Dashboard</h3>

      {/* ── SUMMARY CARDS ── */}
      <div className="dashboard-cards">
        <div className="dashboard-card blue">
          <div className="dashboard-card-icon">
            <FaMoneyBillTrendUp />
          </div>
          <div className="dashboard-card-info">
            <p>Pendapatan Hari Ini</p>
            <h4>Rp {Number(totalPendapatanHariIni).toLocaleString("id-ID")}</h4>
          </div>
        </div>

        <div className="dashboard-card green">
          <div className="dashboard-card-icon">
            <TfiStatsUp />
          </div>
          <div className="dashboard-card-info">
            <p>Pendapatan Bulan Ini</p>
            <h4>
              Rp {Number(totalPendapatanBulanIni).toLocaleString("id-ID")}
            </h4>
          </div>
        </div>

        <div className="dashboard-card purple">
          <div className="dashboard-card-icon">
            <FaCartShopping />
          </div>
          <div className="dashboard-card-info">
            <p>Pesanan Hari Ini</p>
            <h4>{pesananHariIni.length} Pesanan</h4>
          </div>
        </div>

        <div className="dashboard-card orange">
          <div className="dashboard-card-icon">
            <FaUserGroup />
          </div>
          <div className="dashboard-card-info">
            <p>Total Pelanggan</p>
            <h4>{pelanggan.length} Orang</h4>
          </div>
        </div>

        <div className="dashboard-card red">
          <div className="dashboard-card-icon">
            <IoIosWarning />
          </div>
          <div className="dashboard-card-info">
            <p>Stok Menipis</p>
            <h4>{produkMenipis.length} Produk</h4>
          </div>
        </div>

        <div className="dashboard-card teal">
          <div className="dashboard-card-icon">
            <FaBox />
          </div>
          <div className="dashboard-card-info">
            <p>Total Pesanan</p>
            <h4>{pesanan.length} Pesanan</h4>
          </div>
        </div>
      </div>

      {/* ── GRAFIK ── */}
      <div className="dashboard-charts">
        {/* Grafik pendapatan */}
        <div className="dashboard-chart-card">
          <h4>Pendapatan 7 Hari Terakhir</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={grafikData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tgl" fontSize={12} />
              <YAxis
                fontSize={12}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v) => [
                  `Rp ${Number(v).toLocaleString("id-ID")}`,
                  "Pendapatan",
                ]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3a7bd5"
                strokeWidth={2}
                dot={{ fill: "#3a7bd5", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grafik jumlah pesanan */}
        <div className="dashboard-chart-card">
          <h4>Jumlah Pesanan 7 Hari Terakhir</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={grafikData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tgl" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "Pesanan"]} />
              <Bar dataKey="jumlah" fill="#3a7bd5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── BAWAH: PESANAN TERBARU + STOK MENIPIS ── */}
      <div className="dashboard-bottom">
        {/* Pesanan terbaru */}
        <div>
          <h4>Pesanan Terbaru</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Tanggal</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pesananTerbaru.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    align="center"
                    style={{ color: "#888", padding: 16 }}
                  >
                    Belum ada pesanan
                  </td>
                </tr>
              ) : (
                pesananTerbaru.map((p) => (
                  <tr key={p.id}>
                    <td>{p.pelanggan?.nama || "-"}</td>
                    <td>
                      {new Date(p.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ fontWeight: 600, color: "#295f98" }}>
                      Rp {Number(p.total).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stok menipis */}
        <div>
          <h4> Stok Menipis</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Stok</th>
                <th>Min Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produkMenipis.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    align="center"
                    style={{ color: "#888", padding: 16 }}
                  >
                    Semua stok aman ✓
                  </td>
                </tr>
              ) : (
                produkMenipis.map((produk) => (
                  <tr key={produk.id}>
                    <td>{produk.nama_barang}</td>
                    <td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: produk.stok === 0 ? "#fde8e8" : "#fff3cd",
                          color: produk.stok === 0 ? "#e74c3c" : "#856404",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {produk.stok}
                      </span>
                    </td>
                    <td style={{ color: "#888" }}>{produk.min_stok}</td>
                    <td>
                      {editStokId === produk.uuid ? (
                        <>
                          <input
                            type="number"
                            value={stokTambah}
                            onChange={(e) => setStokTambah(e.target.value)}
                            placeholder="Tambah stok"
                            style={{ width: "50px" }}
                          />
                          <button
                            onClick={() => handleSimpanStok(produk)}
                            style={{
                              margin: "8px",
                              background: "#27ae60",
                              color: "white",
                            }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditStokId(null);
                              setStokTambah("");
                            }}
                            className="btn-delete"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditStokId(produk.uuid)}
                          className="btn-tambah"
                        >
                          Tambah Stok
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
