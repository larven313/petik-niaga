import "./Sidebar.css";
import logo from "../../assets/img/petik.jpg";
import { NavLink } from "react-router-dom";

const Sidebar = ({ open, closeSidebar }) => {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <NavLink to={"/"} className="sidebar-logo">
        <img src={logo} alt="logo" />
        <h3>PeTIK Niaga</h3>
      </NavLink>

      <ul>
        <li>
          <NavLink
            to="/dashboard"
            end
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/pesanan"
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            Pesanan
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/produk"
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            Produk
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/dashboard/kategori"
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            Kategori
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/pelanggan"
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            Pelanggan
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/kartu"
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            Kartu
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/users"
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            Users
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/history"
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? "menu active" : "menu")}
          >
            History
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
