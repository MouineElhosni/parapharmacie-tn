import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import { waLinkStore } from "../config";

function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await API.post("/subscribers", { email: email.trim() });
      showToast("Merci ! Vous êtes inscrit(e) à notre newsletter.");
      setEmail("");
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.includes("déjà")) {
        showToast("Cet e-mail est déjà inscrit.", "error");
      } else {
        showToast("Merci ! Vous êtes inscrit(e) à notre newsletter.");
        setEmail("");
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-brand-950 text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <img
              src="/logo.jpeg"
              alt="Parapharmacie.Tn"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gold-500"
            />
            Parapharmacie<span className="text-gold-400">.Tn</span>
          </h2>
          <p className="mt-3 text-brand-100/70">
            Votre parapharmacie en ligne : cosmétiques, soins, nutrition et hygiène
            de qualité pour toute la famille.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-brand-50">Navigation</h3>
          <ul className="space-y-2 text-brand-100/70">
            <li><Link to="/" className="hover:text-gold-300 transition">Accueil</Link></li>
            <li><Link to="/shop" className="hover:text-gold-300 transition">Boutique</Link></li>
            <li><Link to="/about" className="hover:text-gold-300 transition">À propos</Link></li>
            <li><Link to="/contact" className="hover:text-gold-300 transition">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-gold-300 transition">FAQ</Link></li>
          </ul>
        </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-brand-50">Aide</h3>
            <ul className="space-y-2 text-brand-100/70">
              <li><Link to="/faq" className="hover:text-gold-300 transition">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 transition">Contact</Link></li>
              <li><Link to="/about" className="hover:text-gold-300 transition">À propos</Link></li>
            </ul>
          </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-brand-50">Newsletter</h3>
          <p className="text-brand-100/70 mb-4">
            Recevez nos promotions et conseils bien-être.
          </p>
          <form onSubmit={handleNewsletter} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="flex-1 px-3 py-2 rounded-lg bg-brand-950 text-white placeholder-gold-300/60 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <button disabled={subscribing} className="bg-gold-500 px-4 py-2 rounded-lg hover:bg-brand-700 transition font-semibold disabled:opacity-50">
              {subscribing ? "..." : "OK"}
            </button>
          </form>

          <div className="mt-5 text-brand-100/70 text-sm">
            <p>Tél : +216 58 940 189</p>
            <p>Béja, Tunisie</p>
            <a
              href={waLinkStore("Bonjour 👋")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-3 bg-[#25D366] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1ebe5b] transition"
            >
              💬 Commander sur WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-800 text-center py-4 text-brand-100/60">
        © {new Date().getFullYear()} Parapharmacie.Tn. Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;
