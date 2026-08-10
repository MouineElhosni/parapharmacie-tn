import { useEffect, useState } from "react";
import API from "../services/api";

function PromoBanner() {
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    API.get("/products/promo")
      .then((res) => setPromo(res.data))
      .catch(() => setPromo(null));
  }, []);

  if (!promo || !promo.active) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-center px-4 py-3">
      <p className="text-sm sm:text-base font-bold">
        🔥 PROMO WEEK-END : −{promo.percent}% sur toute la boutique — uniquement ce week-end !
      </p>
      <p className="text-xs sm:text-sm text-red-100 mt-0.5">
        Livraison gratuite partout en Tunisie · Paiement à la livraison
      </p>
    </div>
  );
}

export default PromoBanner;
