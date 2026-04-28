const express = require("express");

const app = express();

app.get("/api", async (req, res) => {
  try {
    const r = await fetch("https://shitcoins.club/atms/getAtmsData");
    const data = await r.json();

    const atm = data.find(x => x.id === 1682); // zmień ID jeśli chcesz

    if (!atm) {
      return res.json({ error: "Nie znaleziono ATM" });
    }

    const lastSeen = atm.last_seen || 0;
    const now = Math.floor(Date.now() / 1000);

    const online = (now - lastSeen < 15 * 60);

    res.json({
      amount: atm.balances?.PLN ?? 0,
      status: atm.is_cash_available === 1 ? "JEST GOTÓWKA" : "BRAK GOTÓWKI",
      online: online ? "ONLINE" : "OFFLINE",
      time: new Date().toLocaleTimeString("pl-PL")
    });

  } catch (e) {
    res.json({ error: "Błąd API" });
  }
});

app.listen(3000, () => console.log("API działa"));
