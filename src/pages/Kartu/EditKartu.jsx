import axiosInstance from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditKartu = () => {
  const navigate = useNavigate();

  // State untuk menyimpan input form
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [diskon, setDiskon] = useState(0);
  const [iuran, setIuran] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { uuid } = useParams();

  useEffect(() => {
    getProductCardByID();
  }, []);

  const getProductCardByID = async () => {
    setLoading(true);
    try {
      const cards = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/kartu/${uuid}`,
      );

      console.log(cards);
      setKode(cards.data.data.kode);
      setNama(cards.data.data.nama);
      setDiskon(cards.data.data.diskon);
      setIuran(cards.data.data.iuran);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    console.log("URL:", `${import.meta.env.VITE_API_URL}/kartu/${uuid}`);
    console.log("uuid:", uuid);
    try {
      const formData = new FormData();
      formData.append("kode", kode);
      formData.append("nama", nama);
      formData.append("diskon", diskon / 100);
      formData.append("iuran", iuran);

      await axiosInstance.put(
        `${import.meta.env.VITE_API_URL}/kartu/${uuid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      navigate(-1);
    } catch (error) {
      const apiErrors = error.response?.data?.errors || [];

      if (apiErrors.length > 0) {
        const errorPerField = {};
        apiErrors.forEach((e) => {
          errorPerField[e.path] = e.msg;
        });
        setErrors(errorPerField);
      } else {
        setErrors({ umum: error.response?.data?.msg || "Gagal menyimpan" });
      }
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleIuranChange = (e) => {
    const angkaBersih = e.target.value.replace(/\./g, "").replace(/\D/g, ""); // ← hapus titik dulu, baru hapus non-angka
    setIuran(angkaBersih);
  };

  return (
    <div>
      <div className="users-page">
        <div className="users-header">
          <h3>Tambah Kategori</h3>
        </div>

        <form onSubmit={handleSubmit} className="form-wrapper">
          <div className="form-grid">
            <div>
              <label>Kode</label>
              <input
                type="text"
                name="kode"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className={errors.kode && `input-error`}
                required
              />
              {errors.kode && <span className="error">{errors.kode}</span>}
            </div>

            <div>
              <label>Nama Kartu</label>
              <input
                type="text"
                name="nama_kartu"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={errors.nama && `input-error`}
                required
              />
              {errors.nama && <span className="error">{errors.nama}</span>}
            </div>

            <div>
              <label>Diskon</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  name="diskon"
                  value={diskon}
                  onChange={(e) => setDiskon(e.target.value)}
                  className={errors.diskon && `input-error`}
                  required
                />
                <span>%</span>
              </div>

              {errors.diskon && <span className="error">{errors.diskon}</span>}
            </div>

            <div>
              <label>Iuran</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>Rp</span>
                <input
                  type="text"
                  value={Number(iuran).toLocaleString("id-ID")}
                  onChange={handleIuranChange}
                  placeholder="0"
                  required
                />
              </div>
              {errors.iuran && <span className="error">{errors.iuran}</span>}
            </div>

            <div className="btn-group form-full">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-delete"
                disabled={loading}
              >
                Batal
              </button>
              <button type="submit" className="btn-tambah" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKartu;
