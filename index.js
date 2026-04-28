const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api", async (req, res) => {
  try {
    const r = await fetch("https://www.bitomat.com/en/bitomaty/bitomat-klodzko");
    const html = await r.text();

    // wyciągamy dane z JS
    const match = html.match(/Prices data:\s*(\{.*?\})/s);

    if (!match) {
      return res.json({ error: "Nie znaleziono danych" });
    }

    const json = JSON.parse(match[1]);

    // spróbujmy znaleźć PLN
    let amount = "brak";

    const text = JSON.stringify(json);
    const pln = text.match(/(\d[\d\s]*)\s*PLN/);

    if (pln) {
      amount = pln[1].replace(/\s/g, "");
    }

    res.json({
      amount,
      time: new Date().toLocaleTimeString()
    });

  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log("API działa bez Puppeteer");
});
