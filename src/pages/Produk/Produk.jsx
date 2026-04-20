import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import noimage from "../../assets/img/default2.png";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../components/Table/Table.css";
import "./Produk.css";

const ITEMS_PER_PAGE = 10;

const Produk = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { search } = useOutletContext();

  useEffect(() => {
    getAllProducts();
    getProductCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getAllProducts = async () => {
    setLoading(true);
    try {
      const products = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/produk`,
      );
      setData(products.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getProductCategories = async () => {
    try {
      const categories = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/jenis-produk`,
      );
      setCategories(categories.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCategoryName = (jenis_produk_id) => {
    const category = categories.find((c) => c.id === jenis_produk_id);
    return category ? category.nama : "-";
  };

  const filteredData = data.filter((produk) => {
    const keywoard = search.toLowerCase();
    return (
      produk.nama_barang?.toLowerCase().includes(keywoard) ||
      produk.stok?.toString().includes(keywoard) ||
      produk.min_stok?.toString().includes(keywoard) ||
      produk.harga?.toString().includes(keywoard) ||
      getCategoryName(produk.jenis_produk_id).toLowerCase().includes(keywoard)
    );
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleEdit = (produk) => {
    navigate(`/dashboard/produk/edit/${produk.uuid}`);
  };

  const handleDelete = async (uuid) => {
    const confirm = window.confirm("Yakin ingin menghapus produk ini?");
    if (!confirm) return;
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_API_URL}/produk/${uuid}`,
      );
      getAllProducts();
    } catch (error) {
      alert(error.response?.data?.msg || "Gagal menghapus produk");
      console.log(error.response);
    }
  };

  return (
    <div className="produk-page">
      {/* HEADER */}
      <div className="produk-header">
        <h3>Daftar Produk</h3>
        <NavLink to="/dashboard/produk/add" className="btn-add">
          Tambah Produk
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Stok</th>
              <th>Minimal Stok</th>
              <th>Harga</th>
              <th>Kategori</th>
              <th>Gambar</th>
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
              paginatedData.map((produk, index) => (
                <tr key={index}>
                  <td align="center">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td>{produk.nama_barang}</td>
                  <td align="center">{produk.stok}</td>
                  <td align="center">{produk.min_stok}</td>
                  <td align="center">
                    Rp {Number(produk.harga).toLocaleString("id-ID")}
                  </td>
                  <td align="center">
                    {getCategoryName(produk.jenis_produk_id)}
                  </td>
                  <td align="center">
                    {produk.url ? (
                      <img src={produk.url} alt="gambar" width={120} />
                    ) : (
                      <img src={noimage} alt="gambar" width={64} />
                    )}
                  </td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleEdit(produk)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(produk.uuid)}
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

export default Produk;
