const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => {
  res.send("API działa. Wejdź na /api");
});

app.get("/api", async (req, res) => {
  try {
    const r = await fetch("https://shitcoins.club/atms/getAtmsData");
    const data = await r.json();

    const atm = data.find(x => x.id === 867);

    if (!atm) {
      return res.json({ error: "Nie znaleziono ATM" });
    }

    const lastSeen = atm.last_seen || 0;
    const now = Math.floor(Date.now() / 1000);
    const online = now - lastSeen < 15 * 60;

    res.json({
      amount: atm.balances?.PLN ?? 0,
      status: atm.is_cash_available === 1 ? "JEST GOTÓWKA" : "BRAK GOTÓWKI",
      online: online ? "ONLINE" : "OFFLINE",
      time: new Date().toLocaleTimeString("pl-PL")
    });

  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(PORT, () => console.log("API działa na porcie " + PORT));
