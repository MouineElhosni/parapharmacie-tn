import usePageTitle from "../hooks/usePageTitle";

const faqs = [
  {
    q: "Comment passer une commande ?",
    a: "Cliquez sur « Commander » sur le produit souhaité, renseignez votre nom, téléphone et adresse de livraison, puis validez. Nous vous appelons pour vérifier la commande avant d'envoyer le livreur.",
  },
  {
    q: "Quels sont les moyens de paiement ?",
    a: "Nous proposons le paiement à la livraison (espèces) : vous payez directement au livreur à la réception de votre commande.",
  },
  {
    q: "Puis-je commander directement par WhatsApp ?",
    a: "Oui ! Contactez-nous sur WhatsApp via le bouton 💬 présent sur le site, envoyez le produit souhaité et vos coordonnées, et nous nous occupons du reste.",
  },
  {
    q: "Quels sont les délais et frais de livraison ?",
    a: "La livraison est gratuite partout en Tunisie et effectuée sous 48h après confirmation de votre commande.",
  },
  {
    q: "Puis-je suivre ma commande ?",
    a: "Oui, connectez-vous à votre espace « Mon compte » pour suivre l'état de vos commandes (en attente, en traitement, expédiée, livrée).",
  },
  {
    q: "Puis-je retourner un produit ?",
    a: "Les produits non utilisés et non ouverts peuvent être retournés sous 7 jours après réception, sur présentation du ticket. Contactez notre service client.",
  },
  {
    q: "Les produits sont-ils certifiés ?",
    a: "Oui, tous nos produits proviennent de marques reconnues et respectent les normes de sécurité et de qualité en vigueur.",
  },
];

function FAQ() {
  usePageTitle("FAQ");

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Questions fréquentes</h1>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <details
            key={idx}
            className="bg-white rounded-2xl shadow-md overflow-hidden group"
          >
            <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-800 flex justify-between items-center hover:bg-gold-50 transition">
              {f.q}
              <span className="text-brand-800 group-open:rotate-45 transition-transform">＋</span>
            </summary>
            <div className="px-6 pb-5 text-gray-600 leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
