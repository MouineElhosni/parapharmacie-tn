export const STORE_NAME = "Parapharmacie.Tn";
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "21658940189";

export const waLinkTo = (phone, text = "") =>
  `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const waLinkStore = (text = "") => waLinkTo(WHATSAPP_NUMBER, text);

// Returns the price actually displayed/paid (promo price during weekend promo)
export const effectivePrice = (product) => {
  const price = Number(product.price);
  const sale = product.sale_price != null ? Number(product.sale_price) : null;
  return sale && sale < price ? sale : price;
};
