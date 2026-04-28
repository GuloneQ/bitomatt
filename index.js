import express from "express";

const app = express();

app.get("/api", async (req, res) => {
  try {
    const r = await fetch("https://shitcoins.club/atms/getAtmsData");
    const data = await r.json();

    // 👉 wybierz miasto (zmień ID)
    const atm = data.find(x => x.id === 867); // KŁODZKO
    // const atm = data.find(x => x.id === 867); // WROCŁAW

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
      time: new Date().toLocaleTimeString("pl-PL"),
      lastSeen: new Date(lastSeen * 1000).toLocaleString("pl-PL")
    });

  } catch (e) {
    res.json({ error: "Błąd API" });
  }
});

app.listen(3000, () => console.log("API działa"));
