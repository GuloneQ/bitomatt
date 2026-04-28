const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(
      "https://www.bitomat.com/en/bitomaty/bitomat-klodzko",
      { waitUntil: "networkidle2" }
    );

    await new Promise(r => setTimeout(r, 6000));

    const text = await page.evaluate(() => document.body.innerText);

    await browser.close();

    const match = text.match(/(\d[\d\s]*)\s*PLN/);
    const amount = match ? match[1].replace(/\s/g, "") : "brak";

    res.json({
      amount,
      time: new Date().toLocaleTimeString()
    });

  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log("Serwer działa");
});
