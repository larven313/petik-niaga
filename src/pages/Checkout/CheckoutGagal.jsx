// CheckoutGagal.jsx
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Checkout.css";

const CheckoutGagal = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order_id") || "-";

  return (
    <div className="checkout-center">
      <div className="checkout-result-card">
        <div className="checkout-result-icon">❌</div>
        <h2>Pembayaran Gagal</h2>
        <p>Terjadi kesalahan saat memproses pembayaran kamu</p>
        {orderId !== "-" && (
          <div className="checkout-result-info">
            <div className="checkout-result-row">
              <span>Order ID</span>
              <span>{orderId}</span>
            </div>
          </div>
        )}
        <button className="checkout-btn-primary" onClick={() => navigate(-1)}>
          Coba Lagi
        </button>
      </div>
    </div>
  );
};

export default CheckoutGagal;
