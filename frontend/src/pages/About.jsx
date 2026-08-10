import { Link } from "react-router-dom";
import TrustBadges from "../components/TrustBadges";
import usePageTitle from "../hooks/usePageTitle";

const values = [
  { icon: "🌿", title: "Qualité", text: "Nous ne sélectionnons que des produits certifiés et testés dermatologiquement." },
  { icon: "🚚", title: "Rapidité", text: "Livraison de vos commandes en 48h partout en Tunisie." },
  { icon: "🎧", title: "Conseil", text: "Une équipe de professionnels à votre écoute pour vous guider." },
  { icon: "💯", title: "Confiance", text: "Des prix justes et transparents, sans surprise." },
];

function About() {
  usePageTitle("À propos");

  return (
    <div>
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-5xl font-bold">À propos de Parapharmacie.Tn</h1>
          <p className="mt-6 text-lg text-emerald-50">
            Votre parapharmacie en ligne de confiance : prendre soin de vous et de votre
            famille au quotidien, c'est notre métier.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Notre histoire</h2>
          <p className="text-gray-600 leading-relaxed">
            Parapharmacie.Tn est née d'une conviction simple : l'accès aux soins, aux cosmétiques et
            aux compléments alimentaires de qualité doit être facile pour tous. Depuis notre
            lancement en Tunisie, nous avons accompagné des centaines de clients avec des
            produits sélectionnés avec soin, des conseils personnalisés et une livraison
            rapide à domicile.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Que ce soit pour votre routine beauté, votre santé au quotidien ou votre bébé,
            notre équipe est là pour vous orienter vers le bon produit, au bon prix.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Nos valeurs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="text-5xl mb-4">{v.icon}</div>
              <h3 className="text-xl font-bold text-gray-800">{v.title}</h3>
              <p className="text-gray-500 mt-2">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Prêt à découvrir nos produits ?</h2>
        <Link
          to="/shop"
          className="inline-block mt-4 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
        >
          Voir la boutique
        </Link>
      </section>

      <TrustBadges />
    </div>
  );
}

export default About;
