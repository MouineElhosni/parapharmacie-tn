import { Link } from "react-router-dom";
import { productImage } from "../services/api";

const categoryImages = {
  "Bébé & Maman": "shampoo-bebe.jpg",
  "Cheveux": "cheveux.jpg",
  "Compléments Alimentaires": "omega3.jpg",
  Corps: "gel-douche.jpg",
  "Matériel Médical": "thermometre.jpg",
  Solaire: "creme-solaire.jpg",
  Visage: "masque-hydratant.jpg",
};

function CategoryCard({ category }) {
  const image = categoryImages[category]
    ? productImage(categoryImages[category])
    : null;

  return (
    <Link
      to={`/shop?category=${encodeURIComponent(category)}`}
      className="
        bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1
        hover:ring-2 hover:ring-gold-300 transition-all duration-300
        p-8 text-center block
      "
    >
      <div className="w-24 h-24 mx-auto rounded-full bg-gold-50 flex items-center justify-center mb-4 overflow-hidden ring-2 ring-gold-200">
        {image ? (
          <img
            src={image}
            alt={category}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">🛍️</span>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-800">{category}</h3>
      <p className="text-gray-400 text-sm mt-1">Voir les produits</p>
    </Link>
  );
}

export default CategoryCard;
