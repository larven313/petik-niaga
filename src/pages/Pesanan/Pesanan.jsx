import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import noimage from "../../assets/img/default2.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../components/Table/Table.css";
import "./Pesanan.css";
import "../../components/Table/Table.css";

const ITEMS_PER_PAGE = 10; // ← ganti sesuai kebutuhan

const Pesanan = () => {
  const [pesanan, setPesanan] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { search } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1); // ← tambah state halaman

  useEffect(() => {
    getCustomers();
  }, []);

  // ← reset ke halaman 1 setiap kali search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getCustomers = async () => {
    setLoading(true);
    try {
      const customers = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/pesanan`,
      );

      console.log(customers);
      setPesanan(customers.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pesanan.filter((user) => {
    const keyword = search.toLowerCase();
    return (
      user.pelanggan?.nama?.toLowerCase().includes(keyword) ||
      user.tanggal?.toLowerCase().includes(keyword) ||
      String(user.total).includes(keyword)
    );
  });

  // ← hitung total halaman
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // ← potong data sesuai halaman aktif
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleEdit = (uuid) => {
    navigate(`/dashboard/pesanan/edit/${uuid}`);
  };

  const handleDetail = (uuid) => {
    navigate(`/dashboard/pesanan/detail/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    const yakin = window.confirm("Yakin ingin menghapus pesanan ini?");
    if (!yakin) return;
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_API_URL}/pesanan/${uuid}`,
      );
      getCustomers();
    } catch (error) {
      alert(error.response?.data?.msg || "Gagal menghapus pesanan");
    }
  };

  return (
    <div className="pesanan-page">
      {/* HEADER */}
      <div className="pesanan-header">
        <h3>Daftar Pesanan</h3>

        <NavLink to="/dashboard/pesanan/add" className="btn-add">
          Tambah Pesanan
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Total</th>
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
              paginatedData.map((user, index) => (
                <tr key={index}>
                  <td align="center">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}{" "}
                    {/* ← nomor urut tetap benar */}
                  </td>
                  <td>{user.pelanggan?.nama}</td>
                  <td>
                    {new Date(user.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td>Rp {Number(user.total).toLocaleString("id-ID")}</td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleDetail(user.uuid)}
                      className="btn-edit"
                    >
                      Detail
                    </button>
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

export default Pesanan;
