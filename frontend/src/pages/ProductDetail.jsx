import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API, { productImage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { effectivePrice } from "../config";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";
import Skeleton from "../components/Skeleton";
import usePageTitle from "../hooks/usePageTitle";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [related, setRelated] = useState([]);

  usePageTitle(product?.name);

  useEffect(() => {
    setLoading(true);
    setProduct(null);

    API.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setError("");
        API.get(`/products/${id}/reviews`).then((r) => setReviews(r.data)).catch(() => {});
      })
      .catch((err) => setError(err.response?.data?.message || "Produit introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.category) return;
    const pid = product.id;
    API.get(`/products?category=${encodeURIComponent(product.category)}&limit=4&sort=rating`)
      .then((res) => setRelated(res.data.products.filter((p) => p.id !== pid)))
      .catch(() => setRelated([]));
  }, [product?.category, product?.id]);

  const handleOrder = () => {
    navigate(`/commander/${product.id}`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await API.post(`/products/${id}/reviews`, { rating: myRating, comment: myComment });
      showToast("Merci ! Votre avis a été publié.");
      setMyComment("");
      const [revs, prod] = await Promise.all([
        API.get(`/products/${id}/reviews`),
        API.get(`/products/${id}`),
      ]);
      setReviews(revs.data);
      setProduct(prod.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Échec de l'envoi de l'avis", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton />
          <div className="space-y-4">
            <Skeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500 text-xl mb-4">{error || "Produit introuvable"}</p>
        <Link to="/shop" className="text-brand-800 font-semibold hover:underline">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const image = productImage(product.image);
  const price = Number(product.price);
  const displayPrice = effectivePrice(product);
  const onSale = displayPrice < price;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <nav className="text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-brand-800">Accueil</Link> /{" "}
        <Link to="/shop" className="hover:text-brand-800">Boutique</Link> /{" "}
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-96">
          {image ? (
            <img src={image} alt={product.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-8xl text-gray-300">🌿</span>
          )}
        </div>

        <div>
          {product.category && (
            <span className="bg-gold-50 text-brand-800 text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>
          )}
          <h1 className="text-4xl font-bold text-gray-800 mt-3">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <StarRating value={Number(product.avg_rating) || 0} size="text-xl" />
            <span className="text-gray-500">
              ({Number(product.avg_rating || 0).toFixed(1)} · {product.review_count || 0} avis)
            </span>
          </div>

          {onSale && (
            <span className="inline-block bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full mt-2">
              🔥 Promo week-end −{Math.round(((price - displayPrice) / price) * 100)}%
            </span>
          )}
          <p className="text-3xl font-bold text-brand-800 mt-2">
            {displayPrice.toFixed(2)} DT
            {onSale && (
              <span className="ml-2 text-lg text-gray-400 line-through font-normal">
                {price.toFixed(2)} DT
              </span>
            )}
          </p>
          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleOrder}
              disabled={Number(product.stock) <= 0}
              className="bg-brand-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Number(product.stock) <= 0 ? "En rupture de stock" : "🛵 Commander par livraison"}
            </button>
          </div>

          <div className="mt-8 bg-white rounded-xl p-5 shadow">
            <div className="flex justify-between text-gray-600">
              <span>Disponibilité</span>
              <span className={Number(product.stock) > 0 ? "text-brand-800 font-semibold" : "text-red-600 font-semibold"}>
                {Number(product.stock) > 0 ? `En stock (${product.stock})` : "Rupture de stock"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ REVIEWS ============ */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Avis clients ({reviews.length})</h2>

        {user && (
          <form onSubmit={handleReview} className="bg-white rounded-2xl shadow p-6 mb-8 max-w-2xl">
            <h3 className="font-bold mb-3">Donner votre avis</h3>
            <StarRating value={myRating} onChange={setMyRating} size="text-2xl" />
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce produit..."
              className="mt-4 w-full border border-gray-300 rounded-xl p-3 h-24 focus:outline-none focus:ring-2 focus:ring-gold-400"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="mt-4 bg-brand-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-900 transition disabled:opacity-50"
            >
              {reviewSubmitting ? "Publication..." : "Publier mon avis"}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 bg-white rounded-2xl shadow p-8 text-center">
            Aucun avis pour le moment. Soyez le premier à donner votre avis !
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{r.user_name}</p>
                    <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <StarRating value={r.rating} size="text-sm" />
                </div>
                {r.comment && <p className="mt-3 text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ RELATED ============ */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
