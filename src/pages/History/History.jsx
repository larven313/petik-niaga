import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance.jsx";
import noimage from "../../assets/img/default2.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../components/Table/Table.css";

const ITEMS_PER_PAGE = 10; // ← ganti sesuai kebutuhan

const History = () => {
  const [histories, setHistories] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { search } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1); // ← tambah state halaman

  useEffect(() => {
    getHistories();
  }, []);

  // ← reset ke halaman 1 setiap kali search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getHistories = async () => {
    setLoading(true);
    try {
      const histories = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/history`,
      );

      const sorted = histories.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setHistories(sorted);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = histories.filter((history) => {
    const keyword = search.toLowerCase();
    return (
      history.action?.toLowerCase().includes(keyword) ||
      history?.user?.username?.toLowerCase().includes(keyword) ||
      history.table?.toLowerCase().includes(keyword) ||
      history.value?.toLowerCase().includes(keyword)
    );
  });

  // ← hitung total halaman
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // ← potong data sesuai halaman aktif
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleEdit = (produk) => {
    alert(`Edit produk: ${produk.uuid}`);
    navigate(`/dashboard/produk/edit/${produk.uuid}`);
  };

  const handleDelete = (index) => {
    alert(`Delete produk index: ${index}`);
  };

  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="users-header">
        <h3>Daftar History</h3>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Action</th>
              <th>Tabel</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <td key={i}>
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
              paginatedData.map((history, index) => (
                <tr key={index}>
                  <td align="center">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}{" "}
                    {/* ← nomor urut tetap benar */}
                  </td>
                  <td>{history?.user?.username}</td>
                  <td>{history.action}</td>
                  <td>{history.table}</td>
                  <td>{history.value}</td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleDelete(index)}
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

export default History;
