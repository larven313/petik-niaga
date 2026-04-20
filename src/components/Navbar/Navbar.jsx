import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";
import avatar from "../../assets/img/petik.jpg";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ search, setSearch, toggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Decode token saat mount
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="navbar-search-wrapper desktop-only">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="navbar-right" ref={dropdownRef}>
        <button
          className="search-btn mobile-only"
          onClick={() => setShowSearch((v) => !v)}
        >
          <span className="material-symbols-outlined">search</span>
        </button>

        {/* Tampilkan username di sebelah avatar */}
        {user && <span className="navbar-username">{user.username}</span>}

        <div className="navbar-avatar" onClick={() => setOpen((v) => !v)}>
          <img src={avatar} alt="User" />
        </div>

        {open && (
          <div className="navbar-dropdown">
            <NavLink to={"/dashboard/profile"}>Profile</NavLink>
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {showSearch && (
        <div className="navbar-search-wrapper mobile-search">
          <span className="material-symbols-outlined">search</span>
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
    </header>
  );
};

export default Navbar;
