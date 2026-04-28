const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3000;

const BITOMAT_URL = "https://www.bitomat.com/en/bitomaty/bitomat-klodzko";

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
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage({
      viewport: { width: 390, height: 900 },
      userAgent:
        "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36"
    });

    await page.goto(BITOMAT_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(15000);

    const text = await page.locator("body").innerText();

    let amount = "brak";
    let status = "nieznany";

    const amountPatterns = [
      /(\d[\d\s]*)\s*PLN/i,
      /available\s+for\s+immediate\s+withdrawal[\s\S]{0,80}?(\d[\d\s]*)/i,
      /(\d[\d\s]*)[\s\S]{0,80}?available\s+for\s+immediate\s+withdrawal/i
    ];

    for (const pattern of amountPatterns) {
      const m = text.match(pattern);
      if (m) {
        amount = m[1].replace(/\s/g, "");
        break;
      }
    }

    const statusMatch = text.match(/\b(Online|Offline|Available|Unavailable)\b/i);
    if (statusMatch) status = statusMatch[1];

    cache = {
      amount,
      status,
      time: new Date().toLocaleTimeString("pl-PL"),
      error: null
    };

    console.log("DATA:", cache);
  } catch (e) {
    cache = {
      ...cache,
      time: new Date().toLocaleTimeString("pl-PL"),
      error: e.message
    };

    console.log("ERROR:", e.message);
  } finally {
    if (browser) await browser.close();
    checking = false;
  }

  return cache;
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

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
