// routes/weather.js
const express = require("express");
const router = express.Router();
const { getWeather } = require("../services/weatherService");

// GET /api/weather?city=Nome+da+Cidade
router.get("/", async (req, res) => {
  try {
    const city = req.query.city;
    const data = await getWeather(city);
    res.json(data);
  } catch (err) {
    console.error("[routes/weather] Erro inesperado:", err);
    res.status(500).json({ error: "Não foi possível obter os dados do clima." });
  }
});

module.exports = router;
