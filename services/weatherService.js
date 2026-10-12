// weatherService.js
// Responsável por buscar dados de clima em uma API externa (OpenWeatherMap)
// e por gerar dados de demonstração quando não há chave de API configurada.

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const DEFAULT_CITY = "São Paulo";

/**
 * Gera dados fictícios de clima, claramente marcados como demo:true,
 * usados quando WEATHER_API_KEY não está definido.
 */
function getDemoWeather(city) {
  return {
    city: city || DEFAULT_CITY,
    temperature: 24,
    feelsLike: 25,
    condition: "clouds",
    description: "parcialmente nublado (demonstração)",
    humidity: 62,
    windSpeed: 14,
    rainChance: 30,
    demo: true
  };
}

/**
 * Busca o clima real via OpenWeatherMap.
 * Lança erro se a chamada falhar; quem chama decide o fallback.
 */
async function fetchRealWeather(city) {
  const query = encodeURIComponent(city || DEFAULT_CITY);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&lang=pt_br&appid=${WEATHER_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro na API de clima: ${response.status}`);
  }
  const data = await response.json();

  return {
    city: data.name || city || DEFAULT_CITY,
    temperature: data.main?.temp,
    feelsLike: data.main?.feels_like,
    condition: (data.weather?.[0]?.main || "").toLowerCase(),
    description: data.weather?.[0]?.description || "",
    humidity: data.main?.humidity,
    windSpeed: data.wind?.speed != null ? Math.round(data.wind.speed * 3.6) : null, // m/s -> km/h
    rainChance: data.pop != null ? Math.round(data.pop * 100) : null,
    demo: false
  };
}

/**
 * Ponto único de entrada usado pela rota /api/weather.
 * Cai automaticamente no modo demonstrativo se a chave não existir
 * ou se a chamada externa falhar.
 */
async function getWeather(city) {
  if (!WEATHER_API_KEY) {
    return getDemoWeather(city);
  }
  try {
    return await fetchRealWeather(city);
  } catch (err) {
    console.error("[weatherService] Falha ao buscar clima real, usando modo demonstrativo:", err.message);
    return getDemoWeather(city);
  }
}

module.exports = { getWeather, getDemoWeather };
