import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditKategori = () => {
  const navigate = useNavigate();

  // State untuk menyimpan input form
  const [categories, setCategories] = useState("");
  const [gambarBaru, setGambarBaru] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { uuid } = useParams();

  useEffect(() => {
    getProductCategoriesByID();
  }, []);

  const getProductCategoriesByID = async () => {
    setLoading(true);
    try {
      const categories = await axios.get(
        `${import.meta.env.VITE_API_URL}/jenis-produk/${uuid}`,
      );

      console.log(categories);
      setCategories(categories.data.data.nama);
      setPreview(categories.data.data.url);
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

    try {
      const formData = new FormData();
      formData.append("nama", categories);

      if (gambarBaru) {
        formData.append("gambar", gambarBaru);
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/jenis-produk/${uuid}`,
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
    } finally {
      setLoading(false);
    }
  };

  const handleChangeGambar = (e) => {
    const file = e.target.files[0];
    setGambarBaru(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div>
      <div className="users-page">
        <div className="users-header">
          <h3>Tambah Kategori</h3>
        </div>

        <form onSubmit={handleSubmit} className="form-wrapper">
          <div className="form-grid">
            {/* Input Nama Kategori */}
            <div>
              <label>Nama Kategori</label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="Contoh: Elektronik"
                className={errors.nama && `input-error`}
                required
              />
              {errors.nama && <span className="error">{errors.nama}</span>}
            </div>

            {/* Input Gambar */}
            <div>
              <label>Gambar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleChangeGambar}
                className={errors.umum && `input-error`}
              />
              {preview && (
                <img src={preview} alt="gambar-preview" width="220px" />
              )}
              {errors.umum && <span className="error">{errors.umum}</span>}
            </div>

            {/* Tombol Aksi */}
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

export default EditKategori;
