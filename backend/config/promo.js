const PROMO = {
  enabled: true,
  // Jours de la promo (JS getDay): 0=dimanche, 1=lundi, ..., 5=vendredi, 6=samedi
  days: [6, 0],
  percent: 20,
};

const round2 = (n) => Math.round(n * 100) / 100;

function isPromoActive(date = new Date()) {
  if (!PROMO.enabled) return false;
  return PROMO.days.includes(date.getDay());
}

function promoPrice(price, date = new Date()) {
  if (!isPromoActive(date)) return Number(price);
  return round2(Number(price) * (1 - PROMO.percent / 100));
}

function promoInfo(date = new Date()) {
  return {
    active: isPromoActive(date),
    percent: PROMO.percent,
    days: PROMO.days,
  };
}

module.exports = { PROMO, isPromoActive, promoPrice, promoInfo };
