const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3000;

let cache = {
  amount: "ładowanie",
  status: "ładowanie",
  time: "-",
  error: null
};

let checking = false;

async function checkBitomat() {
  if (checking) return cache;
  checking = true;

  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://www.bitomat.com/en/bitomaty/bitomat-klodzko", {
      waitUntil: "networkidle",
      timeout: 60000
    });

    await page.waitForTimeout(8000);

    const text = await page.locator("body").innerText();

    const amountMatch = text.match(/(\d[\d\s]*)\s*PLN/i);
    const statusMatch = text.match(/\b(Online|Offline|Available|Unavailable)\b/i);

    cache = {
      amount: amountMatch ? amountMatch[1].replace(/\s/g, "") : "brak",
      status: statusMatch ? statusMatch[1] : "nieznany",
      time: new Date().toLocaleTimeString("pl-PL"),
      error: null
    };

    console.log(cache);
  } catch (e) {
    cache.error = e.message;
    cache.time = new Date().toLocaleTimeString("pl-PL");
    console.log("Błąd:", e.message);
  } finally {
    if (browser) await browser.close();
    checking = false;
  }

  return cache;
}

app.get("/", (req, res) => {
  res.send("Bitomat API działa. Wejdź na /api");
});

app.get("/api", async (req, res) => {
  const data = await checkBitomat();
  res.json(data);
});

app.listen(PORT, () => {
  console.log("API działa na porcie " + PORT);
});
