// server.js
// Servidor Express: serve o frontend estático e expõe a API de clima.

require("dotenv").config();
const path = require("path");
const express = require("express");

const weatherRoutes = require("./routes/weather");

const app = express();
const PORT = process.env.PORT || 3000;

// API
app.use("/api/weather", weatherRoutes);

// Frontend estático (pasta ../frontend)
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// Qualquer outra rota GET devolve o index.html (SPA simples)
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  const keyStatus = process.env.WEATHER_API_KEY ? "chave configurada" : "modo demonstrativo (sem WEATHER_API_KEY)";
  console.log(`Ciclo da Água rodando em http://localhost:${PORT}`);
  console.log(`Clima e Tempo: ${keyStatus}`);
});
