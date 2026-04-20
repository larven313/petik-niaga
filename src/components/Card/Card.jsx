import "./Card.css";

const Card = ({ title, children, size = "md", className = "" }) => {
  return (
    <div className={`card card-${size} ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
