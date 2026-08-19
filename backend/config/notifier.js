const nodemailer = require("nodemailer");
const db = require("./db");

const SITE_URL = process.env.SITE_URL || "https://parapharmacie-tn.onrender.com";
const STORE_NAME = "Parapharmacie.Tn";

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

async function getSubscribers() {
  const result = await db.query(
    "SELECT phone, email FROM subscribers WHERE phone IS NOT NULL OR email IS NOT NULL"
  );
  const phones = [...new Set(result.rows.map((r) => r.phone).filter(Boolean))];
  const emails = [...new Set(result.rows.map((r) => r.email).filter(Boolean))];
  return { phones, emails };
}

// Welcome message sent when a new subscriber joins
async function sendWelcomeSubscriber({ phone, email }) {
  const shopUrl = `${SITE_URL}/shop`;

  if (phone) {
    const waText = [
      `👋 Bienvenue chez ${STORE_NAME} !`,
      ``,
      `Merci pour votre inscription ! 🎉`,
      `Vous serez notifié(e) dès qu'un nouveau produit ou une promotion sera disponible.`,
      ``,
      `🛒 Découvrez notre boutique : ${shopUrl}`,
    ].join("\n");
    await sendWhatsApp(phone, waText);
  }

  if (email) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(90deg,#1e3a5f,#2d5a87);padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">👋 Bienvenue chez ${STORE_NAME} !</h1>
        </div>
        <div style="padding:28px;text-align:center">
          <p style="font-size:16px;color:#1f2937;margin:0 0 12px">Merci pour votre inscription ! 🎉</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px">Vous serez notifié(e) dès qu'un nouveau produit ou une promotion sera disponible.</p>
          <a href="${shopUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold">
            Découvrir la boutique
          </a>
        </div>
        <div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px">
          ${STORE_NAME} — Livraison dans toute la Tunisie
        </div>
      </div>
    `;
    await sendEmail(email, `👋 Bienvenue chez ${STORE_NAME} !`, html);
  }
}

// Notify all subscribers when a new product is added
async function notifySubscribersNewProduct(product) {
  try {
    const { phones, emails } = await getSubscribers();

    if (phones.length === 0 && emails.length === 0) {
      console.log("[notifier] aucun abonné à notifier");
      return;
    }

    const name = product.name;
    const price = Number(product.price).toFixed(2);
    const shopUrl = `${SITE_URL}/shop`;

    const waText = [
      `🆕 NOUVEAU PRODUIT chez ${STORE_NAME} !`,
      ``,
      `✨ ${name}`,
      `💰 Prix : ${price} DT`,
      ``,
      `👉 Commandez vite : ${shopUrl}`,
    ].join("\n");

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(90deg,#1e3a5f,#2d5a87);padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">🆕 Nouveau produit disponible !</h1>
        </div>
        <div style="padding:28px;text-align:center">
          <p style="font-size:18px;font-weight:bold;color:#1f2937;margin:0 0 8px">${name}</p>
          <p style="font-size:22px;color:#1e3a5f;font-weight:bold;margin:0 0 20px">${price} DT</p>
          <a href="${shopUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold">
            Voir sur la boutique
          </a>
        </div>
        <div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px">
          ${STORE_NAME} — Livraison dans toute la Tunisie
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

// Notify all subscribers about a promo or offer (admin-triggered)
async function notifySubscribersPromo({ title, message, discount }) {
  try {
    const { phones, emails } = await getSubscribers();

    if (phones.length === 0 && emails.length === 0) {
      console.log("[notifier] aucun abonné à notifier pour la promo");
      return { phones: 0, emails: 0 };
    }

    const shopUrl = `${SITE_URL}/shop`;
    const discountText = discount ? ` (-${discount}%)` : "";

    const waText = [
      `🎉 OFFRE SPÉCIALE chez ${STORE_NAME} !`,
      ``,
      title ? `📌 ${title}` : "",
      message ? `\n${message}` : "",
      discountText ? `\n🔥 Réduction : ${discountText}` : "",
      ``,
      `👉 Profitez-en maintenant : ${shopUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(90deg,#d97706,#f59e0b);padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">🎉 Offre spéciale !</h1>
        </div>
        <div style="padding:28px;text-align:center">
          ${title ? `<p style="font-size:18px;font-weight:bold;color:#1f2937;margin:0 0 8px">${title}</p>` : ""}
          ${message ? `<p style="font-size:14px;color:#6b7280;margin:0 0 12px">${message}</p>` : ""}
          ${discount ? `<p style="font-size:22px;color:#d97706;font-weight:bold;margin:0 0 20px">-${discount}% de réduction</p>` : ""}
          <a href="${shopUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold">
            Voir les offres
          </a>
        </div>
        <div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px">
          ${STORE_NAME} — Livraison dans toute la Tunisie
        </div>
      </div>
    `;

    let sentPhones = 0;
    let sentEmails = 0;

    for (const phone of phones) {
      await sendWhatsApp(phone, waText);
      sentPhones++;
    }
    for (const email of emails) {
      await sendEmail(email, `🎉 ${title || "Offre spéciale"} ${STORE_NAME}`, emailHtml);
      sentEmails++;
    }

    return { phones: sentPhones, emails: sentEmails };
  } catch (err) {
    console.error("[notifier] promo erreur :", err.message);
    return { phones: 0, emails: 0 };
  }
}

module.exports = {
  notifySubscribersNewProduct,
  notifySubscribersPromo,
  sendWelcomeSubscriber,
};
