import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API, { productImage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Skeleton from "../components/Skeleton";
import { waLinkStore, STORE_NAME, effectivePrice } from "../config";
import usePageTitle from "../hooks/usePageTitle";

function Order() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_name: user?.name || "",
    customer_email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    quantity: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  usePageTitle(product ? `Commander - ${product.name}` : "Commander");

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.response?.data?.message || "Produit introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || "",
        customer_email: user.email || "",
      }));
    }
  }, [user]);

  const setField = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post("/orders", {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        address: form.address,
        phone: form.phone,
        city: form.city,
        notes: form.notes,
        payment_method: "cod",
        items: [{ product_id: Number(id), quantity: Number(form.quantity) }],
      });

      const orderId = res.data.orderId;
      const total = res.data.total;
      const loyalty = res.data.loyalty;
      const giftLines =
        loyalty?.giftEarned
          ? [``, `🎁 C'est votre ${loyalty.ordersCount}e commande : un cadeau gratuit vous attend avec cette commande ! Merci pour votre fidélité 💚`]
          : loyalty
            ? [``, `🎁 Plus que ${loyalty.nextGiftIn} commande(s) avant votre cadeau gratuit !`]
            : [];
      const message = [
        `🛍️ NOUVELLE COMMANDE #${orderId}`,
        `• Produit : ${product.name} × ${Number(form.quantity)}`,
        `• Total : ${total} DT (paiement à la livraison)`,
        `• Client : ${form.customer_name}`,
        `• Téléphone : ${form.phone}`,
        `• Adresse : ${form.address}${form.city ? `, ${form.city}` : ""}`,
        ``,
        `Merci de confirmer et de planifier la livraison 🙏`,
        ...giftLines,
      ].join("\n");

      setOrderResult({
        orderId,
        total,
        quantity: Number(form.quantity),
        address: form.address,
        city: form.city,
        message,
        loyalty,
      });
      showToast("Commande envoyée ! Nous vous appellerons pour la confirmer.");

      // Ouvre WhatsApp directement (pas un popup → fiable sur mobile)
      window.location.href = waLinkStore(message);
    } catch (err) {
      showToast(err.response?.data?.message || "Échec de la commande", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
        <Skeleton />
        <Skeleton />
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
  const stock = Number(product.stock);
  const displayPrice = effectivePrice(product);
  const onSale = displayPrice < Number(product.price);
  const total = (displayPrice * Number(form.quantity || 1)).toFixed(2);

  // ---- Success screen ----
  if (orderResult) {
    const loyalty = orderResult.loyalty || {};
    const giftEarned = Boolean(loyalty.giftEarned);
    const nextGiftIn = Number(loyalty.nextGiftIn) || 0;
    const ordersCount = Number(loyalty.ordersCount) || 1;
    const progressToGift = ((ordersCount % 5) / 5) * 100;
    const message =
      orderResult.message ||
      [
        `Bonjour ${STORE_NAME} 👋`,
        `Je viens de passer une commande :`,
        ``,
        `🛍️ Commande #${orderResult.orderId}`,
        `• ${product.name} × ${orderResult.quantity}`,
        `• Total : ${orderResult.total} DT (paiement à la livraison)`,
        `• Adresse : ${orderResult.address}${orderResult.city ? `, ${orderResult.city}` : ""}`,
        `• Téléphone : ${form.phone}`,
        ``,
        `Merci de me confirmer la commande 🙏`,
      ].join("\n");

    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <p className="text-7xl mb-4">✅</p>
          <h1 className="text-3xl font-bold text-gray-800">Commande envoyée !</h1>
          <p className="text-brand-800 font-semibold mt-2">
            Merci pour votre confiance, {form.customer_name || "cher client"} ! 🙏
          </p>
          <p className="text-gray-500 mt-3">
            Commande <span className="font-bold text-brand-800">#{orderResult.orderId}</span> —{" "}
            {orderResult.total} DT
          </p>
          <p className="text-gray-500 mt-2">
            Nous vous appellerons au <span className="font-bold">{form.phone}</span> pour vérifier et
            confirmer votre commande avant la livraison.
          </p>

          {giftEarned && (
            <div className="mt-6 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-300 rounded-2xl p-4">
              <p className="text-3xl mb-1">🎁</p>
              <p className="font-bold text-amber-800">Félicitations ! C'est votre {ordersCount}e commande.</p>
              <p className="text-sm text-amber-700 mt-1">
                Un <b>cadeau gratuit</b> vous attend avec cette commande. On vous le remettra à la
                livraison 💚
              </p>
            </div>
          )}

          {!giftEarned && loyalty.ordersCount > 0 && (
            <div className="mt-6 bg-gold-50 rounded-2xl p-4 text-left">
              <p className="text-sm font-semibold text-brand-800">
                🎁 Programme fidélité : plus que{" "}
                <span className="font-bold">{nextGiftIn}</span> commande{nextGiftIn > 1 ? "s" : ""}{" "}
                avant votre cadeau gratuit !
              </p>
              <div className="mt-2 h-2.5 bg-gold-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-700 to-brand-900 rounded-full transition-all duration-700"
                  style={{ width: `${progressToGift}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {ordersCount % 5}/5 commandes — cadeau offert à chaque 5e commande
              </p>
            </div>
          )}

          <a
            href={waLinkStore(message)}
            target="_blank"
            rel="noreferrer"
            className="mt-8 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-6 py-4 rounded-xl hover:bg-[#1ebe5b] transition"
          >
            <span className="text-xl">💬</span> Confirmer ma commande sur WhatsApp
          </a>

          <p className="text-xs text-gray-400 mt-4">
            WhatsApp s'est ouvert avec le récapitulatif : appuyez sur <b>Envoyer</b> pour que nous
            recevions votre commande immédiatement.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-8 text-brand-800 font-semibold hover:underline"
          >
            ← Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  // ---- Order form ----
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Commander par livraison</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Product summary */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
            <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl text-gray-300">🌿</span>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-brand-800 text-2xl font-bold">
                  {displayPrice.toFixed(2)} DT
                </p>
                {onSale && (
                  <span className="text-sm text-gray-400 line-through">
                    {Number(product.price).toFixed(2)} DT
                  </span>
                )}
              </div>
              {onSale && (
                <p className="text-xs font-semibold text-red-500 mt-1">
                  🔥 Prix promo week-end appliqué
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-gray-600">Quantité</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: Math.max(1, Number(prev.quantity) - 1),
                    }))
                  }
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, stock)}
                  value={form.quantity}
                  onChange={(e) => {
                    const v = Math.min(Math.max(1, Number(e.target.value) || 1), Math.max(1, stock));
                    setForm((prev) => ({ ...prev, quantity: v }));
                  }}
                  className="w-16 text-center border border-gray-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: Math.min(stock, Number(prev.quantity) + 1),
                    }))
                  }
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  +
                </button>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between font-semibold text-gray-800">
                <span>Total</span>
                <span className="text-brand-800 text-xl">{total} DT</span>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                💵 Paiement à la livraison — encaissement en espèces à la réception.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Informations de livraison</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nom complet *</label>
                <input
                  required
                  value={form.customer_name}
                  onChange={setField("customer_name")}
                  placeholder="Votre nom"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Téléphone *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={setField("phone")}
                  placeholder="Ex : 20 123 456"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Adresse de livraison *</label>
                <input
                  required
                  value={form.address}
                  onChange={setField("address")}
                  placeholder="Rue, numéro, quartier"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Ville</label>
                <input
                  value={form.city}
                  onChange={setField("city")}
                  placeholder="Tunis"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={form.customer_email}
                  onChange={setField("customer_email")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Notes (facultatif)
                </label>
                <textarea
                  value={form.notes}
                  onChange={setField("notes")}
                  placeholder="Précisions pour le livreur..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div className="mt-6 bg-gold-50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">🛵</span>
              <div>
                <p className="font-bold text-brand-900">Livraison gratuite à domicile</p>
                <p className="text-sm text-brand-800">
                  Gratuite partout en Tunisie. Nous vous appelons pour vérifier la commande, puis
                  nous envoyons le livreur. Paiement à la réception.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || stock <= 0}
              className="mt-6 w-full bg-brand-800 text-white font-bold py-4 rounded-xl hover:bg-brand-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Envoi de la commande..."
                : stock <= 0
                ? "En rupture de stock"
                : `Commander maintenant — ${total} DT`}
            </button>

            <p className="text-center text-sm text-gray-400 mt-4">
              En commandant, vous acceptez d'être contacté(e) par téléphone pour la confirmation.
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Vous préférez commander directement ?{" "}
            <a
              href={waLinkStore(`Bonjour 👋, je souhaite commander : ${product.name}`)}
              target="_blank"
              rel="noreferrer"
              className="text-[#25D366] font-bold hover:underline"
            >
              Envoyez-nous un WhatsApp 💬
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;
