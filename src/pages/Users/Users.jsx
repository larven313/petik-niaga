import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import noimage from "../../assets/img/default2.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../components/Table/Table.css";
import "./Users.css";

const ITEMS_PER_PAGE = 10;
const BASE_URL = import.meta.env.VITE_API_URL;

// Badge warna berdasarkan role
const roleBadgeStyle = (role) => {
  const styles = {
    superadmin: { backgroundColor: "#cfe2ff", color: "#084298" },
    admin: { backgroundColor: "#fff3cd", color: "#664d03" },
    pelanggan: { backgroundColor: "#d1e7dd", color: "#0a3622" },
  };
  return styles[role] || { backgroundColor: "#e2e3e5", color: "#41464b" };
};

// Badge warna berdasarkan status
const statusBadgeStyle = (status) => ({
  backgroundColor: status === "aktif" ? "#d4edda" : "#f8d7da",
  color: status === "aktif" ? "#155724" : "#721c24",
});

const badgeStyle = {
  padding: "2px 8px",
  borderRadius: 12,
  fontSize: 12,
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { search } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getUsers();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/users`);
      setUsers(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = users.filter((user) => {
    const keyword = search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.role?.toLowerCase().includes(keyword) ||
      user.status?.toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleEdit = (uuid) => {
    navigate(`/dashboard/users/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    const yakin = window.confirm("Yakin ingin menghapus user ini?");
    if (!yakin) return;
    try {
      await axiosInstance.delete(`${BASE_URL}/users/${uuid}`);
      getUsers(); // ← refresh list
    } catch (error) {
      alert(error.response?.data?.msg || "Gagal menghapus user");
    }
  };

  return (
    <div className="user-page">
      {/* HEADER */}
      <div className="user-header">
        <h3>Daftar Users</h3>
        <NavLink to="/dashboard/users/add" className="btn-add">
          Tambah User
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Foto</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}>
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  align="center"
                  style={{ padding: "2rem", color: "red" }}
                >
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              paginatedData.map((user, index) => (
                <tr key={user.uuid}>
                  <td align="center">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>

                  {/* Foto */}
                  <td align="center">
                    <img
                      src={user.url || noimage}
                      alt="foto"
                      width={50}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  </td>

                  <td>{user.username}</td>
                  <td>{user.email ?? "-"}</td>

                  {/* Badge Role */}
                  <td>
                    <span
                      style={{ ...badgeStyle, ...roleBadgeStyle(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Badge Status */}
                  <td>
                    <span
                      style={{
                        ...badgeStyle,
                        ...statusBadgeStyle(user.status),
                      }}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="action-cell">
                    <button
                      onClick={() => handleEdit(user.uuid)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.uuid)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="btn-page"
          >
            &laquo; Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn-page ${currentPage === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="btn-page"
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;
