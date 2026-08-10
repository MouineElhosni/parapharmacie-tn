import { Link } from "react-router-dom";
import { waLinkStore } from "../config";

function Hero() {
  return (
    <section className="
      relative
      overflow-hidden
      bg-gradient-to-r
      from-emerald-600
      via-teal-600
      to-cyan-600
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
        <div className="max-w-xl">
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            Parapharmacie en ligne
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            La beauté et le bien-être,
            <br />
            à portée de main
          </h1>

          <p className="mt-6 text-lg text-emerald-50">
            Cosmétiques, soins de la peau, nutrition et hygiène de qualité.
            Livraison rapide dans toute la Tunisie.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/shop"
              className="
                bg-white
                text-emerald-600
                px-8
                py-3
                rounded-xl
                font-semibold
                hover:bg-emerald-50
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
                hover:bg-white
                hover:text-emerald-600
                transition
              "
            >
              💬 Commander sur WhatsApp
            </a>
          </div>
        </div>

        {/* Image principale */}
        <div className="relative">
          <div className="w-64 h-80 md:w-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/30">
            <img
              src="/hero.jpg"
              alt="Parapharmacie.Tn"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white text-emerald-700 px-4 py-2 rounded-xl shadow-lg font-bold text-sm">
            Livraison gratuite dans toute la Tunisie 🚚
          </div>
        </div>
      </div>

      {/* Background circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/20 rounded-full"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/10 rounded-full"></div>
    </section>
  );
}

export default Hero;
