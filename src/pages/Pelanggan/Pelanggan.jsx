import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import noimage from "../../assets/img/default2.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../../components/Table/Table.css";
import "./Pelanggan.css";

const ITEMS_PER_PAGE = 10;
const BASE_URL = import.meta.env.VITE_API_URL;

const Pelanggan = () => {
  const [pelanggan, setPelanggan] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { search } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getCustomers();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getCustomers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/pelanggan`);
      setPelanggan(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pelanggan.filter((p) => {
    const keyword = search.toLowerCase();
    return (
      p.nama?.toLowerCase().includes(keyword) ||
      p.alamat?.toLowerCase().includes(keyword) ||
      p.user?.username?.toLowerCase().includes(keyword) ||
      p.user?.email?.toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleEdit = (uuid) => {
    navigate(`/dashboard/pelanggan/edit/${uuid}`);
  };

  const handleDelete = async (uuid) => {
    const yakin = window.confirm("Yakin ingin menghapus pelanggan ini?");
    if (!yakin) return;
    try {
      await axiosInstance.delete(`${BASE_URL}/pelanggan/${uuid}`);
      getCustomers(); // ← refresh list
    } catch (error) {
      alert(error.response?.data?.msg || "Gagal menghapus pelanggan");
    }
  };

  return (
    <div className="pelanggan-page">
      {/* HEADER */}
      <div className="pelanggan-header">
        <h3>Daftar Pelanggan</h3>
        <NavLink to="/dashboard/pelanggan/add" className="btn-add">
          Tambah Pelanggan
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Foto</th>
              <th>Nama</th>
              <th>Gender</th>
              <th>Tgl Lahir</th>
              <th>No HP</th>
              <th>Alamat</th>
              <th>Membership</th>
              {/* ← kolom data akun */}
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 12 }).map((_, j) => (
                    <td key={j}>
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  align="center"
                  style={{ padding: "2rem", color: "red" }}
                >
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              paginatedData.map((p, index) => (
                <tr key={p.uuid}>
                  <td align="center">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>

                  {/* Foto dari akun user */}
                  <td align="center">
                    {p.user?.url ? (
                      <img
                        src={p.user.url}
                        alt="foto"
                        width={50}
                        style={{ borderRadius: "50%" }}
                      />
                    ) : (
                      <img
                        src={noimage}
                        alt="foto"
                        width={50}
                        style={{ borderRadius: "50%" }}
                      />
                    )}
                  </td>

                  {/* Data pelanggan */}
                  <td>{p.nama}</td>
                  <td>{p.gender === "L" ? "Laki-laki" : "Perempuan"}</td>
                  <td>
                    {new Date(p.tgl_lahir).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td>{p.no_hp}</td>
                  <td>{p.alamat}</td>
                  <td>{p.kartu?.nama || "-"}</td>

                  {/* Data akun user */}
                  <td>{p.user?.username || "-"}</td>
                  <td>{p.user?.email || "-"}</td>
                  <td>
                    {/* Badge status aktif/nonaktif */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        backgroundColor:
                          p.user?.status === "aktif" ? "#d4edda" : "#f8d7da",
                        color:
                          p.user?.status === "aktif" ? "#155724" : "#721c24",
                      }}
                    >
                      {p.user?.status || "-"}
                    </span>
                  </td>

                  <td className="action-cell">
                    <button
                      onClick={() => handleEdit(p.uuid)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.uuid)}
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

export default Pelanggan;
