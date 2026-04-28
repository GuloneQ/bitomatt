const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/api", async (req, res) => {
  try {
    const r = await fetch("https://shitcoins.club/atms/getAtmsData");
    const data = await r.json();

    const atm = data.find(x => x.id === 1682);

    res.json({
      amount: atm?.balances?.PLN ?? 0,
      status: atm?.is_cash_available === 1 ? "JEST GOTÓWKA" : "BRAK GOTÓWKI",
      time: new Date().toLocaleTimeString("pl-PL")
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(PORT, () => console.log("API działa"));
