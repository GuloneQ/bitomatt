const puppeteer = require("puppeteer");

const WEBHOOK = "TU_WKLEJ_WEBHOOK_DISCORD";

let lastAmount = null;

async function send(msg) {
  if (!WEBHOOK.includes("http")) return;

  await fetch(WEBHOOK, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({content: msg})
  });
}

async function check() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.bitomat.com/en/bitomaty/bitomat-klodzko",
    { waitUntil: "networkidle2" }
  );

  // czekamy aż strona załaduje dane
  await new Promise(r => setTimeout(r, 5000));

  const text = await page.evaluate(() => document.body.innerText);

  const match = text.match(/(\d[\d\s]*)\s*PLN/);
  const amount = match ? match[1].replace(/\s/g, "") : "brak";

  console.log("Kwota:", amount);

  if (lastAmount && amount !== lastAmount) {
    await send(`💰 Zmiana: ${lastAmount} → ${amount} PLN`);
  }

  lastAmount = amount;

  await browser.close();
}

setInterval(check, 60000);
check();
