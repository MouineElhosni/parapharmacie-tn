async function notifyStoreOrder({
  orderId,
  total,
  customer_name,
  phone,
  address,
  items,
  ordersCount,
  giftEarned,
}) {
  const storePhone = (process.env.STORE_WHATSAPP || "21658940189").replace(/\D/g, "");
  const apikey = process.env.CALLMEBOT_APIKEY || "";

  if (!storePhone || !apikey) {
    console.log(
      "[whatsappNotifier] notification ignorée : renseigner CALLMEBOT_APIKEY dans Render"
    );
    return;
  }

  const lines = [
    `🛍️ NOUVELLE COMMANDE #${orderId}`,
    ...items.map(
      (it) =>
        `• ${it.name} × ${it.quantity} = ${(Number(it.price) * Number(it.quantity)).toFixed(2)} DT`
    ),
    `──────────────`,
    `TOTAL : ${Number(total).toFixed(2)} DT (paiement à la livraison)`,
    `Client : ${customer_name}`,
    `Tél : ${phone}`,
    `Adresse : ${address}`,
  ];

  if (giftEarned && ordersCount) {
    lines.push(
      `🎁 FIDÉLITÉ : c'est la ${ordersCount}e commande de ce client — prévoir un cadeau gratuit !`
    );
  } else if (ordersCount) {
    lines.push(
      `🎁 Fidélité : ${ordersCount} commande(s) — cadeau offert à la ${Math.ceil(ordersCount / 5) * 5}e commande.`
    );
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${storePhone}&apikey=${encodeURIComponent(
      apikey
    )}&text=${encodeURIComponent(lines.join("\n"))}`;
    const resp = await fetch(url);
    const text = await resp.text();
    console.log(`[whatsappNotifier] callmebot HTTP ${resp.status} =>`, text.slice(0, 150));
  } catch (err) {
    console.error("[whatsappNotifier] erreur :", err.message);
  }
}

module.exports = { notifyStoreOrder };
