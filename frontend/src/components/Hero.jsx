import { Link } from "react-router-dom";
import { waLinkStore } from "../config";

const MARQUEE_ITEMS = [
  "✨ Livraison 24/48h dans toute la Tunisie",
  "💵 Paiement à la livraison",
  "🔒 Produits 100% authentiques",
  "🎁 Cadeau fidélité offert à chaque 5e commande",
  "🆕 Nouveautés chaque semaine",
];

function Hero() {
  return (
    <section className="
      relative
      overflow-hidden
      bg-gradient-to-r
      from-brand-800
      via-brand-700
      to-brand-800
      animate-gradient
      text-white
      py-24
    ">
      <div className="
        max-w-6xl
        mx-auto
        px-6
        flex
        flex-col
        md:flex-row
        items-center
        justify-between
        gap-10
      ">
        {/* Text */}
        <div className="max-w-xl animate-pop-in">
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm">
            Parapharmacie en ligne
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
            La beauté et le bien-être,
            <br />
            à portée de main
          </h1>

          <p className="mt-6 text-base sm:text-lg text-brand-50">
            Cosmétiques, soins de la peau, nutrition et hygiène de qualité.
            Livraison rapide dans toute la Tunisie.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              to="/shop"
              className="
                bg-white
                text-brand-800
                px-8
                py-3
                rounded-xl
                font-semibold
                text-center
                hover:bg-gold-50
                hover:scale-105
                transition
              "
            >
              Découvrir la boutique
            </Link>

            <a
              href={waLinkStore("Bonjour 👋, je souhaite passer une commande.")}
              target="_blank"
              rel="noreferrer"
              className="
                border
                border-white
                px-8
                py-3
                rounded-xl
                font-semibold
                text-center
                hover:bg-white
                hover:text-brand-800
                transition
              "
            >
              💬 Commander sur WhatsApp
            </a>
          </div>
        </div>

        {/* Image principale */}
        <div className="relative mt-6 sm:mt-0">
          <div className="w-56 h-72 sm:w-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/30">
            <img
              src="/hero.jpg"
              alt="Parapharmacie.Tn"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Carte flottante 1 */}
          <div className="absolute -left-10 top-8 hidden lg:flex items-center gap-2 bg-white text-brand-800 px-4 py-3 rounded-2xl shadow-xl animate-float">
            <span className="text-2xl">🧴</span>
            <div>
              <p className="font-bold text-xs">Soins & Cosmétiques</p>
              <p className="text-[10px] text-gray-400">Marques certifiées</p>
            </div>
          </div>

          {/* Carte flottante 2 */}
          <div className="absolute -right-8 bottom-16 hidden lg:flex items-center gap-2 bg-white text-brand-800 px-4 py-3 rounded-2xl shadow-xl animate-float-slow">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-xs">Livraison rapide</p>
              <p className="text-[10px] text-gray-400">Partout en Tunisie</p>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 bg-white text-brand-800 px-4 py-2 rounded-xl shadow-lg font-bold text-xs sm:text-sm">
            Livraison gratuite dans toute la Tunisie 🚚
          </div>
        </div>
      </div>

      {/* Bande défilante */}
      <div className="relative mt-16 overflow-hidden border-t border-white/10">
        <div className="flex whitespace-nowrap animate-marquee text-sm font-semibold tracking-wide py-3 w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 text-brand-50">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Background circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/20 rounded-full animate-float-slow"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/10 rounded-full"></div>
    </section>
  );
}

export default Hero;
