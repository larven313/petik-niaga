import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import noimage from "../../assets/img/default2.png";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../components/Table/Table.css";
import "./Kartu.css";

const ITEMS_PER_PAGE = 10; // ← ganti sesuai kebutuhan

const Kartu = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { search } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1); // ← tambah state halaman

  useEffect(() => {
    getAllCards();
  }, []);

  // ← reset ke halaman 1 setiap kali search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getAllCards = async () => {
    setLoading(true);
    try {
      const cards = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/kartu`,
      );
      setData(cards.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((kartu) => {
    const keywoard = search.toLowerCase();
    return (
      kartu.kode?.toLowerCase().includes(keywoard) ||
      kartu.nama?.toLowerCase().includes(keywoard) ||
      kartu.diskon?.toString().includes(keywoard) ||
      kartu.iuran?.toString().includes(keywoard)
    );
  });

  // ← hitung total halaman
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // ← potong data sesuai halaman aktif
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleEdit = (kartu) => {
    navigate(`/dashboard/kartu/edit/${kartu.uuid}`);
  };

  const handleDelete = async (uuid) => {
    const confirm = window.confirm("Yakin ingin menghapus kartu ini?");
    if (!confirm) return;
    console.log("UUID yang dikirim:", uuid);
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_API_URL}/kartu/${uuid}`,
      );
      getAllCards();
    } catch (error) {
      alert(error.response?.data?.msg || "Gagal menghapus kartu");
      console.log(error.response);
    }
  };

  return (
    <div className="kartu-page">
      {/* HEADER */}
      <div className="kartu-header">
        <h3>Daftar kartu</h3>
        <NavLink to="/dashboard/kartu/add" className="btn-add">
          Tambah kartu
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode</th>
              <th>Nama</th>
              <th>Diskon</th>
              <th>Iuran</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
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
              paginatedData.map((kartu, index) => (
                <tr key={index}>
                  <td align="center">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}{" "}
                    {/* ← nomor urut tetap benar */}
                  </td>
                  <td>{kartu.kode}</td>
                  <td align="center">{kartu.nama}</td>
                  <td align="center">{kartu.diskon * 100}%</td>
                  <td align="center">{kartu.iuran}</td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleEdit(kartu)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(kartu.uuid)}
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

export default Kartu;
