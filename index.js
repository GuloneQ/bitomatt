const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_WEBHOOK = "TU_WKLEJ_TUTAJ_WEBHOOK_DISCORD";
const ATM_ID = 1682;

let lastState = null;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

async function sendDiscord(data) {
  if (!DISCORD_WEBHOOK.includes("discord.com")) return;

  const icon = data.online === "ONLINE" ? "🟩" : "🟥";

  const message =
`##### BITOMAT - KLODZKO🏦 ####
@everyone
📍 - Lutycka 8, Klodzko
💸 - ${data.amount} PLN
${icon} - ${data.online}
⌛ - ${data.time}
######################`;

  await fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: message,
      allowed_mentions: {
        parse: ["everyone"]
      }
    })
  });
}

async function getBitomatData() {
  const r = await fetch("https://shitcoins.club/atms/getAtmsData");
  const data = await r.json();

  const atm = data.find(x => x.id === ATM_ID);

  if (!atm) {
    throw new Error("Nie znaleziono ATM");
  }

  const lastSeen = atm.last_seen || 0;
  const now = Math.floor(Date.now() / 1000);
  const online = now - lastSeen < 15 * 60;

  return {
    amount: atm.balances?.PLN ?? 0,
    status: atm.is_cash_available === 1 ? "JEST GOTÓWKA" : "BRAK GOTÓWKI",
    online: online ? "ONLINE" : "OFFLINE",
    time: new Date().toLocaleTimeString("pl-PL")
  };
}

app.get("/", (req, res) => {
  res.send("API działa. Wejdź na /api");
});

app.get("/api", async (req, res) => {
  try {
    const current = await getBitomatData();

    const changed =
      !lastState ||
      lastState.amount !== current.amount ||
      lastState.status !== current.status ||
      lastState.online !== current.online;

    if (lastState && changed) {
      await sendDiscord(current);
    }

    lastState = current;

    res.json(current);

  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(PORT, () => console.log("API działa na porcie " + PORT));
