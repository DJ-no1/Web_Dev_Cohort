import "./Card.css";

function Card({ title, description, image }) {
  console.log("card comoponent rendered", { title, description });
  return (
    <div className="card">
      <div className="card-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div style={{ color: "#999", fontSize: "16px" }}>
            No Image Available
          </div>
        )}
      </div>
      <div className="card-content">
        <h1 className="card-title">{title || "Book Title"}</h1>
        <p className="card-description">
          {description || "No description available"}
        </p>
      </div>
    </div>
  );
}

export default Card;
