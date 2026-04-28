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

    await page.goto("https://www.bitomat.com/en/bitomaty/bitomat-klodzko", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 7000));

    const text = await page.evaluate(() => document.body.innerText);
    await browser.close();

    const match = text.match(/(\d[\d\s]*)\s*PLN/i);

    res.json({
      amount: match ? match[1].replace(/\s/g, "") : "brak",
      time: new Date().toLocaleTimeString("pl-PL")
    });

  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(PORT, () => console.log("API działa"));
