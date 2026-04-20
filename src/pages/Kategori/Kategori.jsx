import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import noimage from "../../assets/img/default2.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../components/Table/Table.css";
import "./Kategori.css";

const ITEMS_PER_PAGE = 10; // ← ganti sesuai kebutuhan

const Kategori = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { search } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1); // ← tambah state halaman

  useEffect(() => {
    getProductCategories();
  }, []);

  const getProductCategories = async () => {
    setLoading(true);
    try {
      const categories = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/jenis-produk`,
      );

      // console.log(filteredCategories);
      setCategories(categories.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = categories.filter((category) => {
    return category.nama?.toLowerCase().includes(search.toLowerCase());
  });

  // ← hitung total halaman
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // ← potong data sesuai halaman aktif
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleEdit = (produk) => {
    navigate(`/dashboard/kategori/edit/${produk.uuid}`);
  };

  const handleDelete = async (uuid) => {
    const confirm = window.confirm("Yakin ingin menghapus kategori ini?");
    if (!confirm) return;
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_API_URL}/jenis-produk/${uuid}`,
      );
      getProductCategories();
    } catch (error) {
      alert(error.response?.data?.msg || "Gagal menghapus kategori");
      console.log(error.response);
    }
  };

  return (
    <div className="kategori-page">
      {/* HEADER */}
      <div className="kategori-header">
        <h3>Daftar Kategori</h3>

        <NavLink to="/dashboard/kategori/add" className="btn-add">
          Tambah Kategori
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Gambar</th>
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
              paginatedData.map((category, index) => (
                <tr key={index}>
                  <td align="center">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}{" "}
                    {/* ← nomor urut tetap benar */}
                  </td>
                  <td>{category.nama}</td>
                  <td align="center">
                    {category.url ? (
                      <img src={category.url} alt="gambar" width={120} />
                    ) : (
                      <img src={noimage} alt="gambar" width={64} />
                    )}
                  </td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn-edit"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(category.uuid)}
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

export default Kategori;
