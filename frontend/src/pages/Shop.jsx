import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import PromoBanner from "../components/PromoBanner";
import Skeleton from "../components/Skeleton";
import usePageTitle from "../hooks/usePageTitle";

const PAGE_SIZE = 8;

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  usePageTitle("Boutique");

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);

  useEffect(() => {
    API.get("/products/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("sort", sort);
    params.set("page", page);
    params.set("limit", PAGE_SIZE);

    API.get(`/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Échec du chargement des produits"))
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (key === "page") params.delete("page");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PromoBanner />
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Boutique</h1>

      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-3 flex-1 focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <option value="newest">Nouveautés</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="popular">Les plus populaires</option>
          <option value="rating">Mieux notés</option>
        </select>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {error && <p className="text-center text-red-500 py-16">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Aucun produit trouvé.</p>
          <button
            onClick={() => setSearchParams({})}
            className="mt-4 bg-brand-800 text-white px-6 py-2 rounded-lg hover:bg-brand-900"
          >
            Effacer les filtres
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <p className="text-gray-500 mb-6">{total} produit(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => updateParam("page", page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg bg-white shadow font-semibold hover:bg-gray-100 disabled:opacity-40"
              >
                ←
              </button>
              {pageNumbers.map((n, idx) =>
                n === "..." ? (
                  <span key={`d-${idx}`} className="px-2 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => updateParam("page", n)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      n === page
                        ? "bg-brand-800 text-white"
                        : "bg-white shadow hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                onClick={() => updateParam("page", page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg bg-white shadow font-semibold hover:bg-gray-100 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Shop;
