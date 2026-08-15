import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { waLinkStore } from "../config";
import usePageTitle from "../hooks/usePageTitle";

function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  usePageTitle("Contact");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      showToast("Merci ! Votre message a bien été envoyé.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  const inputClass =
    "border border-gray-300 w-full p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Contactez-nous</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Votre nom"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Votre email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Sujet"
              value={form.subject}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <textarea
              name="message"
              placeholder="Votre message..."
              value={form.message}
              onChange={handleChange}
              className={`${inputClass} h-32`}
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {sending ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Nos coordonnées</h2>
            <div className="space-y-4 text-gray-600">
              <p>📍 Béja, Béja, Tunisie</p>
              <p>📞 <a href="tel:+21658940189" className="hover:text-emerald-600">+216 58 940 189</a></p>
              <p>💬 <a href={waLinkStore("Bonjour 👋")} target="_blank" rel="noreferrer" className="hover:text-emerald-600">WhatsApp : +216 58 940 189</a></p>
              <a
                href="https://www.facebook.com/share/1EDxg2Cedo/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#166FE5] transition"
              >
                🔵 Suivez-nous sur Facebook
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Horaires</h2>
            <div className="space-y-2 text-gray-600">
              <p>Toujours ouvert — 7j/7</p>
              <p className="text-sm text-gray-400">Commandes en ligne 24h/24</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
