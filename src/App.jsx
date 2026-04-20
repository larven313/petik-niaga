import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import DashboardLayout from "./pages/DashboardLayout/DashboardLayout";
import LandingPage from "./pages/LandingPage/LandingPage";
import Users from "./pages/Users/Users";
import Produk from "./pages/Produk/Produk";
import AddProduk from "./pages/Produk/AddProduk";
import Kategori from "./pages/Kategori/Kategori";
import AddKategori from "./pages/Kategori/AddKategori";
import AddUser from "./pages/Users/AddUser";
import Profile from "./pages/Profile/Profile";
import Kartu from "./pages/Kartu/Kartu";
import Pelanggan from "./pages/Pelanggan/Pelanggan";
import AddPelanggan from "./pages/Pelanggan/AddPelanggan";
import Pesanan from "./pages/Pesanan/Pesanan";
import AddPesanan from "./pages/Pesanan/AddPesanan";
import History from "./pages/History/History";
import EditKategori from "./pages/Kategori/EditKategori";
import EditProduk from "./pages/Produk/EditProduk";
import AddKartu from "./pages/Kartu/AddKartu";
import EditKartu from "./pages/Kartu/EditKartu";
import EditPelanggan from "./pages/Pelanggan/EditPelanggan";
import EditUser from "./pages/Users/EditUser";
import DetailPesanan from "./pages/Pesanan/DetailPesanan";
import Checkout from "./pages/Checkout/Checkout";
import CheckoutSelesai from "./pages/Checkout/CheckoutSelesai";
import CheckoutGagal from "./pages/Checkout/CheckoutGagal";
import CheckoutBatal from "./pages/Checkout/CheckoutBatal";
import Login from "./pages/Login/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/checkout/:uuid" element={<Checkout />} />
        <Route path="/checkout/cart" element={<Checkout />} />
        <Route path="/checkout/selesai" element={<CheckoutSelesai />} />
        <Route path="/checkout/gagal" element={<CheckoutGagal />} />
        <Route path="/checkout/batal" element={<CheckoutBatal />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/users/add" element={<AddUser />} />
          <Route path="/dashboard/users/edit/:uuid" element={<EditUser />} />

          {/* Produk */}
          <Route path="/dashboard/produk" element={<Produk />} />
          <Route path="/dashboard/produk/add" element={<AddProduk />} />
          <Route path="/dashboard/produk/edit/:uuid" element={<EditProduk />} />

          {/* Jenis Produk */}
          <Route path="/dashboard/kategori" element={<Kategori />} />
          <Route path="/dashboard/kategori/add" element={<AddKategori />} />
          <Route
            path="/dashboard/kategori/edit/:uuid"
            element={<EditKategori />}
          />

          {/* Pelanggan */}
          <Route path="/dashboard/pelanggan" element={<Pelanggan />} />
          <Route path="/dashboard/pelanggan/add" element={<AddPelanggan />} />
          <Route
            path="/dashboard/pelanggan/edit/:uuid"
            element={<EditPelanggan />}
          />

          {/* Pesanan */}
          <Route path="/dashboard/pesanan" element={<Pesanan />} />
          <Route path="/dashboard/pesanan/add" element={<AddPesanan />} />
          <Route
            path="/dashboard/pesanan/detail/:uuid"
            element={<DetailPesanan />}
          />

          {/* Kartu */}
          <Route path="/dashboard/kartu" element={<Kartu />} />
          <Route path="/dashboard/kartu/add" element={<AddKartu />} />
          <Route path="/dashboard/kartu/edit/:uuid" element={<EditKartu />} />

          {/* History */}
          <Route path="/dashboard/history" element={<History />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
