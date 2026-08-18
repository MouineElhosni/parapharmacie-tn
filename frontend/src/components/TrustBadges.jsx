const badges = [
  { icon: "🚚", title: "Livraison gratuite", text: "Partout en Tunisie, sous 48h" },
  { icon: "💵", title: "Paiement à la livraison", text: "En espèces à la réception" },
  { icon: "🌿", title: "Produits certifiés", text: "Qualité et sécurité garanties" },
  { icon: "🎧", title: "Conseil d'expert", text: "Notre équipe vous accompagne" },
];

function TrustBadges() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((b) => (
          <div
            key={b.title}
            className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-xl transition"
          >
            <div className="w-14 h-14 rounded-full bg-gold-50 flex items-center justify-center text-3xl shrink-0">
              {b.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBadges;
