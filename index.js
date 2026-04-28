const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

const BITOMAT_URL = "https://www.bitomat.com/en/bitomaty/bitomat-klodzko";
const DISCORD_WEBHOOK = "TU_WKLEJ_WEBHOOK_DISCORD";

let lastAmount = null;
let lastStatus = null;
let cachedData = {
  amount: "brak",
  status: "brak",
  time: "brak"
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

async function sendDiscord(message) {
  if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK.includes("TU_WKLEJ")) return;

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message
      })
    });
  } catch (e) {
    console.log("Discord error:", e.message);
  }
}

async function checkBitomat() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto(BITOMAT_URL, {
    waitUntil: "networkidle2",
    timeout: 60000
  });

  await new Promise(resolve => setTimeout(resolve, 7000));

  const text = await page.evaluate(() => document.body.innerText);

  await browser.close();

  const amountMatch = text.match(/(\d[\d\s]*)\s*PLN/i);
  const statusMatch = text.match(/\b(Online|Offline|Available|Unavailable)\b/i);

  const amount = amountMatch ? amountMatch[1].replace(/\s/g, "") : "brak";
  const status = statusMatch ? statusMatch[1] : "nieznany";

  if (lastAmount !== null && amount !== lastAmount) {
    await sendDiscord(
      `💰 Bitomat Kłodzko - zmiana kwoty\nStara: ${lastAmount} PLN\nNowa: ${amount} PLN`
    );
  }

  if (lastStatus !== null && status !== lastStatus) {
    await sendDiscord(
      `🔔 Bitomat Kłodzko - zmiana statusu\nStary: ${lastStatus}\nNowy: ${status}`
    );
  }

  lastAmount = amount;
  lastStatus = status;

  cachedData = {
    amount,
    status,
    time: new Date().toLocaleTimeString("pl-PL")
  };

  console.log("Kwota:", amount, "Status:", status);

  return cachedData;
}

app.get("/", (req, res) => {
  res.send("Bitomat backend działa. Wejdź na /api");
});

app.get("/api", async (req, res) => {
  try {
    const data = await checkBitomat();
    res.json(data);
  } catch (e) {
    console.log("Błąd:", e.message);

    res.json({
      amount: cachedData.amount,
      status: "błąd",
      time: new Date().toLocaleTimeString("pl-PL"),
      error: e.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Serwer działa na porcie " + PORT);
});
