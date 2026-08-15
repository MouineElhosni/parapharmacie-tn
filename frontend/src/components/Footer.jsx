import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { waLinkStore } from "../config";

function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast("Merci ! Vous êtes inscrit(e) à notre newsletter.");
    setEmail("");
  };

  return (
    <footer className="bg-emerald-950 text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <img
              src="/logo.jpeg"
              alt="Parapharmacie.Tn"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-700"
            />
            Parapharmacie<span className="text-emerald-400">.Tn</span>
          </h2>
          <p className="mt-3 text-emerald-200/70">
            Votre parapharmacie en ligne : cosmétiques, soins, nutrition et hygiène
            de qualité pour toute la famille.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-emerald-100">Navigation</h3>
          <ul className="space-y-2 text-emerald-200/70">
            <li><Link to="/" className="hover:text-emerald-300 transition">Accueil</Link></li>
            <li><Link to="/shop" className="hover:text-emerald-300 transition">Boutique</Link></li>
            <li><Link to="/about" className="hover:text-emerald-300 transition">À propos</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-300 transition">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-emerald-300 transition">FAQ</Link></li>
          </ul>
        </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-emerald-100">Aide</h3>
            <ul className="space-y-2 text-emerald-200/70">
              <li><Link to="/faq" className="hover:text-emerald-300 transition">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-300 transition">Contact</Link></li>
              <li><Link to="/about" className="hover:text-emerald-300 transition">À propos</Link></li>
            </ul>
          </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-emerald-100">Newsletter</h3>
          <p className="text-emerald-200/70 mb-4">
            Recevez nos promotions et conseils bien-être.
          </p>
          <form onSubmit={handleNewsletter} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="flex-1 px-3 py-2 rounded-lg bg-emerald-900 text-white placeholder-emerald-300/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button className="bg-emerald-500 px-4 py-2 rounded-lg hover:bg-emerald-400 transition font-semibold">
              OK
            </button>
          </form>

          <div className="mt-5 text-emerald-200/70 text-sm">
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

      <div className="border-t border-emerald-800 text-center py-4 text-emerald-200/60">
        © {new Date().getFullYear()} Parapharmacie.Tn. Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;
