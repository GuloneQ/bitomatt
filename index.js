const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("DZIAŁA ✅");
});

app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    test: "API działa",
    time: new Date().toLocaleTimeString()
  });
});

app.listen(PORT, () => console.log("API działa"));
