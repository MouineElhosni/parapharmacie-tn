const nodemailer = require("nodemailer");
const db = require("./db");

const SITE_URL = process.env.SITE_URL || "https://parapharmacie-tn.onrender.com";

let transporter = null;
function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (Number(process.env.SMTP_PORT) || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

// Envoi d'un message WhatsApp à un numéro via CallMeBot (numéro doit être activé)
async function sendWhatsApp(phone, text) {
  const apikey = process.env.CALLMEBOT_APIKEY || "";
  const clean = String(phone).replace(/\D/g, "");
  if (!clean || !apikey) {
    console.log("[notifier] WhatsApp ignoré (numéro absent ou CALLMEBOT_APIKEY non défini)");
    return;
  }
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${clean}&apikey=${encodeURIComponent(
      apikey
    )}&text=${encodeURIComponent(text)}`;
    const resp = await fetch(url);
    const body = await resp.text();
    console.log(
      `[notifier] callmebot WhatsApp ${clean.slice(0, 4)}*** HTTP ${resp.status} =>`,
      body.slice(0, 120)
    );
  } catch (err) {
    console.error("[notifier] callmebot erreur :", err.message);
  }
}

// Envoi d'un email (SMTP optionnel)
async function sendEmail(to, subject, html) {
  const t = getTransporter();
  if (!t) {
    console.log("[notifier] email ignoré : SMTP non configuré");
    return;
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[notifier] email envoyé à ${to}`);
  } catch (err) {
    console.error("[notifier] email erreur :", err.message);
  }
}

// Notifie tous les abonnés à l'ajout d'un nouveau produit
async function notifySubscribersNewProduct(product) {
  try {
    const result = await db.query(
      "SELECT phone, email FROM subscribers WHERE phone IS NOT NULL OR email IS NOT NULL"
    );

    const phones = [...new Set(result.rows.map((r) => r.phone).filter(Boolean))];
    const emails = [...new Set(result.rows.map((r) => r.email).filter(Boolean))];

    if (phones.length === 0 && emails.length === 0) {
      console.log("[notifier] aucun abonné à notifier");
      return;
    }

    const name = product.name;
    const price = Number(product.price).toFixed(2);
    const shopUrl = `${SITE_URL}/shop`;

    const waText = [
      `🆕 NOUVEAU PRODUIT chez Parapharmacie.Tn !`,
      ``,
      `✨ ${name}`,
      `💰 Prix : ${price} DT`,
      ``,
      `👉 Commandez vite : ${shopUrl}`,
    ].join("\n");

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(90deg,#059669,#0d9488);padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">🆕 Nouveau produit disponible !</h1>
        </div>
        <div style="padding:28px;text-align:center">
          <p style="font-size:18px;font-weight:bold;color:#1f2937;margin:0 0 8px">${name}</p>
          <p style="font-size:22px;color:#059669;font-weight:bold;margin:0 0 20px">${price} DT</p>
          <a href="${shopUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold">
            Voir sur la boutique
          </a>
        </div>
        <div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px">
          Parapharmacie.Tn — Livraison dans toute la Tunisie
        </div>
      </div>
    `;

    for (const phone of phones) {
      await sendWhatsApp(phone, waText);
    }
    for (const email of emails) {
      await sendEmail(email, `🆕 Nouveau produit : ${name}`, emailHtml);
    }
  } catch (err) {
    console.error("[notifier] erreur :", err.message);
  }
}

module.exports = { notifySubscribersNewProduct };
