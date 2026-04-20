// CheckoutBatal.jsx
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const CheckoutBatal = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-center">
      <div className="checkout-result-card">
        <div className="checkout-result-icon">🚫</div>
        <h2>Pembayaran Dibatalkan</h2>
        <p>Kamu membatalkan proses pembayaran</p>
        <button className="checkout-btn-primary" onClick={() => navigate(-1)}>
          Kembali
        </button>
      </div>
    </div>
  );
};

export default CheckoutBatal;
