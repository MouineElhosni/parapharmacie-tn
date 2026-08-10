import { Link } from "react-router-dom";

const categoryEmojis = {
  "Beauté & Soins": "🧴",
  Nutrition: "💊",
  "Hygiène": "🧼",
  "Premiers Soins": "🩹",
  "Bébé & Maman": "👶",
  Santé: "❤️",
  Naturel: "🌿",
};

function CategoryCard({ category }) {
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(category)}`}
      className="
        bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1
        hover:ring-2 hover:ring-emerald-200 transition-all duration-300
        p-8 text-center block
      "
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <span className="text-3xl">{categoryEmojis[category] || "🛍️"}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800">{category}</h3>
      <p className="text-gray-400 text-sm mt-1">Voir les produits</p>
    </Link>
  );
}

export default CategoryCard;
