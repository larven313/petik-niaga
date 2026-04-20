import { useEffect, useState } from "react";
import "./DashboardLayout.css";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const DashboardLayout = () => {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Cek token saat pertama load dan setiap pindah halaman
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    setSearch("");
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar open={sidebarOpen} closeSidebar={closeSidebar} />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <div className="dashboard-main">
        <Navbar
          search={search}
          setSearch={setSearch}
          toggleSidebar={toggleSidebar}
        />

        <main className="dashboard-content">
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
