import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import ProductCard from "./ProductCard";
import Skeleton from "./Skeleton";

function ProductSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/products?sort=popular&limit=8")
      .then((res) => {
        setProducts(res.data.products);
        setError("");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Échec du chargement des produits")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">Produits populaires</h2>
        <Link to="/shop" className="text-brand-800 font-semibold hover:underline">
          Voir tout →
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-400 py-10">Aucun produit disponible.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductSection;
