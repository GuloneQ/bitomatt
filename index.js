const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1498635476083675237/ENCKZutPymK2wEDvB7IW7merl0xPlPVCtH52fhTPet6Y3SYWO8LAyPHfwRzemPYEPyQl";
const ATM_ID = 867; // zmień na 867 dla Wrocławia

let lastState = null;

async function sendDiscord(data, reason = "") {
  const icon = data.online === "ONLINE" ? "🟩" : "🟥";

  const msg =
`##### BITOMAT - KLODZKO🏦 ####
@everyone
📍 - Lutycka 8, Klodzko
💸 - ${data.amount} PLN
${icon} - ${data.online}
⌛ - ${data.time}
${reason}
######################`;

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: msg,
        allowed_mentions: { parse: ["everyone"] }
      })
    });
  } catch (e) {
    console.log("Webhook error:", e);
  }
}

async function getData() {
  const r = await fetch("https://shitcoins.club/atms/getAtmsData");
  const data = await r.json();

  const atm = data.find(x => x.id === ATM_ID);

  if (!atm) throw new Error("Nie znaleziono ATM");

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

// 🔥 GŁÓWNY LOOP (co 5 sekund)
async function loop() {
  try {
    const current = await getData();

    // wysyłka przy starcie
    if (!lastState) {
      await sendDiscord(current, "🚀 START");
    }

    // wysyłka przy zmianie
    if (
      lastState &&
      (
        lastState.amount !== current.amount ||
        lastState.status !== current.status ||
        lastState.online !== current.online
      )
    ) {
      await sendDiscord(current, "🔄 ZMIANA");
    }

    lastState = current;

  } catch (e) {
    console.log("Błąd:", e.message);
  }
}

// uruchom loop co 5s
setInterval(loop, 5000);

// start od razu
loop();

// API do frontendu
app.get("/api", (req, res) => {
  if (!lastState) {
    return res.json({ status: "ŁADOWANIE" });
  }
  res.json(lastState);
});

app.listen(PORT, () => console.log("API działa"));
