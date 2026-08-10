async function notifyStoreOrder(order) {
  const storePhone = (process.env.STORE_WHATSAPP || "").replace(/\D/g, "");
  const apikey = process.env.CALLMEBOT_APIKEY || "";

  if (!storePhone || !apikey) {
    console.log(
      "[whatsappNotifier] notification ignorée : renseigner STORE_WHATSAPP + CALLMEBOT_APIKEY dans Render"
    );
    return;
  }

  const lines = [
    `🛍️ NOUVELLE COMMANDE #${order.orderId}`,
    ...order.items.map(
      (it) =>
        `• ${it.name} × ${it.quantity} = ${(Number(it.price) * Number(it.quantity)).toFixed(2)} DT`
    ),
    `──────────────`,
    `TOTAL : ${Number(order.total).toFixed(2)} DT (paiement à la livraison)`,
    `Client : ${order.customer_name}`,
    `Tél : ${order.phone}`,
    `Adresse : ${order.address}`,
  ].join("\n");

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${storePhone}&apikey=${encodeURIComponent(
      apikey
    )}&text=${encodeURIComponent(lines)}`;
    const resp = await fetch(url);
    const text = await resp.text();
    console.log(`[whatsappNotifier] callmebot HTTP ${resp.status} =>`, text.slice(0, 150));
  } catch (err) {
    console.error("[whatsappNotifier] erreur :", err.message);
  }
}

module.exports = { notifyStoreOrder };
