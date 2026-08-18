import { Link, useNavigate } from "react-router-dom";
import { productImage } from "../services/api";
import { effectivePrice } from "../config";
import StarRating from "./StarRating";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const image = productImage(product.image);
  const price = Number(product.price);
  const displayPrice = effectivePrice(product);
  const onSale = displayPrice < price;

  const handleOrder = (e) => {
    e.preventDefault();
    navigate(`/commander/${product.id}`);
  };

  return (
    <Link
      to={`/shop/${product.id}`}
      className="
        bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl
        hover:-translate-y-2 transition-all duration-300 block relative
        hover:ring-2 hover:ring-gold-300
      "
    >
      <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <span className="text-6xl">🌿</span>
          </div>
        )}
        {onSale && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
            🔥 −{Math.round(((price - displayPrice) / price) * 100)}%
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{product.name}</h2>
        </div>

        {product.category && (
          <span className="bg-gold-50 text-brand-800 text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block">
            {product.category}
          </span>
        )}

        <div className="mt-2 flex items-center gap-2">
          <StarRating value={Number(product.avg_rating) || 0} size="text-sm" />
          <span className="text-xs text-gray-400">
            ({product.review_count || 0})
          </span>
        </div>

        <p className="text-gray-500 mt-2 line-clamp-2">{product.description}</p>

        <div className="flex justify-between items-center mt-5">
          <div className="flex flex-col">
            {onSale && (
              <span className="text-sm text-gray-400 line-through">
                {price.toFixed(2)} DT
              </span>
            )}
            <span className="text-2xl font-bold text-brand-800">
              {displayPrice.toFixed(2)} DT
            </span>
          </div>
          <button
            onClick={handleOrder}
            disabled={Number(product.stock) <= 0}
            className="
              bg-brand-800 text-white px-5 py-2 rounded-lg hover:bg-brand-900
              transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {Number(product.stock) <= 0 ? "Rupture" : "Commander"}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
