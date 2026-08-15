import { useState } from "react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Newsletter() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      showToast("Renseignez au moins un email ou un numéro de téléphone.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/subscribers", {
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      showToast(res.data.message || "Inscription enregistrée !");
      setEmail("");
      setPhone("");
    } catch (err) {
      showToast(err.response?.data?.message || "Une erreur est survenue", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 text-center text-white shadow-xl">
        <h2 className="text-3xl font-bold">Restez au courant</h2>
        <p className="mt-3 text-emerald-100">
          Nouveautés et promotions directement sur <b>WhatsApp</b> ou par email. Cadeau fidélité
          offert à chaque 5e commande 🎁
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Votre numéro WhatsApp"
            className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition disabled:opacity-60"
          >
            {loading ? "..." : "S'inscrire"}
          </button>
        </form>
        <p className="text-xs text-emerald-100 mt-3">
          Email ou téléphone : vous choisissez comment recevoir les nouveautés.
        </p>
      </div>
    </section>
  );
}

export default Newsletter;
