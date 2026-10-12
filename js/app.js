// app.js
// Lógica principal do simulador do Ciclo da Água.

(function () {
  "use strict";

  const ICONS = {
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><g stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/></g></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4.5 4.5 0 0 1-1 8.5H7Z"/></svg>',
    rain: '<svg viewBox="0 0 24 24"><path d="M7 15a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 6.5a4.5 4.5 0 0 1-1 8.5H7Z"/><g stroke-linecap="round"><line x1="8" y1="18" x2="7" y2="21"/><line x1="12" y1="18" x2="11" y2="21"/><line x1="16" y1="18" x2="15" y2="21"/></g></svg>',
    infiltration: '<svg viewBox="0 0 24 24"><path d="M12 2s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10Z"/><line x1="4" y1="20" x2="20" y2="20" stroke-linecap="round"/></svg>',
    flow: '<svg viewBox="0 0 24 24"><path d="M3 9c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" stroke-linecap="round"/><path d="M3 15c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" stroke-linecap="round"/></svg>',
    storage: '<svg viewBox="0 0 24 24"><path d="M4 20 L9 8 L12 14 L15 6 L20 20 Z"/></svg>'
  };

  const state = {
    view: "overview",        // overview | stage | weather
    currentStageIndex: 0,    // índice em CYCLE_STAGES
    playing: false,
    playTimer: null
  };

  // ---------- referências DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const nodesLayer = $("#nodes-layer");
  const arrowsSvg = $("#arrows-svg");
  const stageView = $("#stage-view");
  const weatherView = $("#weather-view");
  const infoTitle = $("#info-title");
  const infoDesc = $("#info-desc");
  const infoIcon = $("#info-icon");
  const stageCounter = $("#stage-counter");
  const prevBtn = $("#prev-stage");
  const nextBtn = $("#next-stage");
  const hintText = $("#hint-text");
  const tooltip = $("#tooltip");
  const btnPlay = $("#btn-play");
  const btnPause = $("#btn-pause");
  const btnRestart = $("#btn-restart");

  // ============================================================
  // RENDERIZAÇÃO DO PALCO CENTRAL (nós + setas)
  // ============================================================

  function buildNodes() {
    nodesLayer.innerHTML = "";
    CYCLE_STAGES.forEach((stage, idx) => {
      const btn = document.createElement("button");
      btn.className = "node-btn";
      btn.dataset.stageId = stage.id;
      btn.style.left = stage.pos.x + "%";
      btn.style.top = stage.pos.y + "%";
      btn.innerHTML = ICONS[stage.icon] || "";
      btn.setAttribute("aria-label", stage.title);
      btn.addEventListener("click", () => selectStage(idx, { fromNode: true }));
      nodesLayer.appendChild(btn);
    });
  }

  function buildArrows() {
    // curva cada seta para fora do centro do círculo, dando efeito de fluxo circular
    const cx = 50, cy = 50;
    let markup = "";
    CYCLE_STAGES.forEach((stage) => {
      const target = CYCLE_STAGES.find((s) => s.id === stage.arrowTo);
      if (!target) return;
      const mx = (stage.pos.x + target.pos.x) / 2;
      const my = (stage.pos.y + target.pos.y) / 2;
      // vetor do centro até o ponto médio, estendido para fora -> ponto de controle
      const dx = mx - cx, dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const factor = 1.35; // quanto a seta "estufa" para fora
      const ctrlX = cx + dx * factor;
      const ctrlY = cy + dy * factor;
      markup += `<path data-from="${stage.id}" data-to="${target.id}" d="M ${stage.pos.x} ${stage.pos.y} Q ${ctrlX} ${ctrlY} ${target.pos.x} ${target.pos.y}"></path>`;
    });
    arrowsSvg.innerHTML = markup;
  }

  function highlightArrowFor(stageId) {
    document.querySelectorAll(".arrows-svg path").forEach((p) => {
      p.classList.toggle("active-arrow", p.dataset.from === stageId);
    });
  }

  function highlightNode(stageId) {
    document.querySelectorAll(".node-btn").forEach((n) => {
      n.classList.toggle("active", n.dataset.stageId === stageId);
    });
  }

  // ============================================================
  // PAINEL DIREITO
  // ============================================================

  function showOverviewPanel() {
    infoIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2c3 4 6 7.5 6 11.5A6 6 0 0 1 6 13.5C6 9.5 9 6 12 2Z"/></svg>';
    infoTitle.textContent = OVERVIEW_CONTENT.title;
    infoDesc.textContent = OVERVIEW_CONTENT.short;
    stageCounter.parentElement.style.visibility = "hidden";
    highlightNode(null);
    highlightArrowFor(null);
    hintText.innerHTML = '<span class="drop-small">💧</span> Clique nos ícones para começar';
  }

  function showStagePanel(idx) {
    const stage = CYCLE_STAGES[idx];
    infoIcon.innerHTML = ICONS[stage.icon] || "";
    infoTitle.textContent = stage.title;
    infoDesc.textContent = stage.long;
    stageCounter.textContent = `${stage.order} / ${CYCLE_STAGES.length}`;
    stageCounter.parentElement.style.visibility = "visible";
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === CYCLE_STAGES.length - 1;
    highlightNode(stage.id);
    highlightArrowFor(stage.id);
    hintText.textContent = stage.short;
  }

  // ============================================================
  // NAVEGAÇÃO
  // ============================================================

  function setActiveSidebarButton() {
    document.querySelectorAll(".side-btn[data-view]").forEach((b) => {
      let isActive = false;
      if (state.view === "weather" && b.dataset.view === "weather") isActive = true;
      if (state.view === "overview" && b.dataset.view === "overview") isActive = true;
      if (state.view === "stage" && b.dataset.stage === CYCLE_STAGES[state.currentStageIndex]?.id) isActive = true;
      b.classList.toggle("active", isActive);
    });
  }

  function selectStage(idx, opts = {}) {
    stopSimulation();
    state.view = "stage";
    state.currentStageIndex = idx;
    switchView("stage");
    showStagePanel(idx);
    setActiveSidebarButton();
  }

  function showOverview() {
    stopSimulation();
    state.view = "overview";
    switchView("stage");
    showOverviewPanel();
    setActiveSidebarButton();
  }

  function switchView(view) {
    if (view === "weather") {
      stageView.hidden = true;
      weatherView.hidden = false;
      $("#right-panel").hidden = true;
    } else {
      stageView.hidden = false;
      weatherView.hidden = true;
      $("#right-panel").hidden = false;
    }
  }

  function showWeather() {
    stopSimulation();
    state.view = "weather";
    switchView("weather");
    setActiveSidebarButton();
    loadWeather();
  }

  // ============================================================
  // MODO SIMULAÇÃO
  // ============================================================

  function startSimulation() {
    state.playing = true;
    btnPlay.hidden = true;
    btnPause.hidden = false;
    if (state.view !== "stage") {
      state.view = "stage";
      switchView("stage");
    }
    document.querySelectorAll(".node-btn").forEach((n) => n.classList.remove("playing"));
    runSimStep();
    state.playTimer = setInterval(runSimStep, 2600);
  }

  function runSimStep() {
    const stage = CYCLE_STAGES[state.currentStageIndex];
    document.querySelectorAll(".node-btn").forEach((n) => {
      n.classList.toggle("playing", n.dataset.stageId === stage.id);
    });
    showStagePanel(state.currentStageIndex);
    setActiveSidebarButton();
    state.currentStageIndex = (state.currentStageIndex + 1) % CYCLE_STAGES.length;
  }

  function pauseSimulation() {
    state.playing = false;
    clearInterval(state.playTimer);
    btnPlay.hidden = false;
    btnPause.hidden = true;
  }

  function stopSimulation() {
    if (state.playing) pauseSimulation();
    document.querySelectorAll(".node-btn").forEach((n) => n.classList.remove("playing"));
  }

  function restartSimulation() {
    stopSimulation();
    state.currentStageIndex = 0;
    showOverview();
  }

  // ============================================================
  // CLIMA E TEMPO
  // ============================================================

  const WEATHER_CONDITION_ICON = {
    clear: "☀️", clouds: "☁️", rain: "🌧️", drizzle: "🌦️",
    thunderstorm: "⛈️", snow: "❄️", mist: "🌫️", default: "🌤️"
  };

  // Usado apenas quando o backend não está rodando (ex.: index.html aberto
  // direto no navegador, via file://, sem "npm start"). Garante que a seção
  // de Clima nunca fique quebrada, mesmo sem servidor.
  function getLocalDemoWeather(city) {
    return {
      city: city || "São Paulo",
      temperature: 24,
      feelsLike: 25,
      condition: "clouds",
      description: "parcialmente nublado (demonstração local)",
      humidity: 62,
      windSpeed: 14,
      rainChance: 30,
      demo: true
    };
  }

  async function loadWeather(city) {
    const card = $("#weather-main-card");
    const grid = $("#weather-grid");
    const demoFlag = $("#demo-flag");
    card.innerHTML = '<div class="weather-loading" id="weather-loading">Carregando dados do clima…</div>';
    grid.hidden = true;
    demoFlag.hidden = true;

    // Se a página foi aberta direto do arquivo (sem servidor Express rodando),
    // nem tenta chamar a API — já usa o modo demonstrativo local.
    if (window.location.protocol === "file:") {
      renderWeather(getLocalDemoWeather(city));
      return;
    }

    try {
      const url = new URL("/api/weather", window.location.origin);
      if (city) url.searchParams.set("city", city);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Resposta não-OK do servidor: " + res.status);
      const data = await res.json();
      renderWeather(data);
    } catch (err) {
      console.error("Erro ao buscar clima do backend, usando demonstração local:", err);
      renderWeather(getLocalDemoWeather(city));
    }
  }

  function renderWeather(data) {
    const card = $("#weather-main-card");
    const grid = $("#weather-grid");
    const demoFlag = $("#demo-flag");
    const icon = WEATHER_CONDITION_ICON[(data.condition || "").toLowerCase()] || WEATHER_CONDITION_ICON.default;

    card.innerHTML = `
      <div class="weather-primary">
        <div class="weather-icon-big">${icon}</div>
        <div>
          <div class="weather-temp">${Math.round(data.temperature)}°C</div>
          <div class="weather-place">${data.city || "Sua região"}</div>
          <div class="weather-condition">${data.description || ""}</div>
        </div>
      </div>
    `;

    $("#tile-humidity").textContent = data.humidity != null ? `${data.humidity}%` : "—";
    $("#tile-wind").textContent = data.windSpeed != null ? `${data.windSpeed} km/h` : "—";
    $("#tile-rain").textContent = data.rainChance != null ? `${data.rainChance}%` : "—";
    $("#tile-feels").textContent = data.feelsLike != null ? `${Math.round(data.feelsLike)}°C` : "—";
    grid.hidden = false;

    demoFlag.hidden = !data.demo;
  }

  // ============================================================
  // TOOLTIPS DA SIDEBAR
  // ============================================================

  function bindTooltips() {
    document.querySelectorAll("[data-tooltip]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        tooltip.textContent = el.dataset.tooltip;
        const rect = el.getBoundingClientRect();
        tooltip.style.top = rect.top + rect.height / 2 + "px";
        tooltip.classList.add("show");
      });
      el.addEventListener("mouseleave", () => tooltip.classList.remove("show"));
    });
  }

  // ============================================================
  // EVENTOS
  // ============================================================

  function bindEvents() {
    document.querySelectorAll(".side-btn[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === "overview") showOverview();
        else if (view === "weather") showWeather();
        else if (view === "stage") {
          const idx = CYCLE_STAGES.findIndex((s) => s.id === btn.dataset.stage);
          if (idx > -1) selectStage(idx);
        }
      });
    });

    prevBtn.addEventListener("click", () => {
      if (state.currentStageIndex > 0) selectStage(state.currentStageIndex - 1);
    });
    nextBtn.addEventListener("click", () => {
      if (state.currentStageIndex < CYCLE_STAGES.length - 1) selectStage(state.currentStageIndex + 1);
    });

    btnPlay.addEventListener("click", startSimulation);
    btnPause.addEventListener("click", pauseSimulation);
    btnRestart.addEventListener("click", restartSimulation);

    $("#weather-back").addEventListener("click", showOverview);
    $("#city-search-btn").addEventListener("click", () => {
      const city = $("#city-input").value.trim();
      if (city) loadWeather(city);
    });
    $("#city-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#city-search-btn").click();
    });

    $("#help-btn").addEventListener("click", () => {
      alert("Clique nos ícones ao redor da paisagem para explorar cada etapa do ciclo da água, use a barra lateral para navegar diretamente, ou pressione \"Iniciar ciclo\" para ver a simulação automática.");
    });
  }

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  function init() {
    buildNodes();
    buildArrows();
    bindEvents();
    bindTooltips();
    showOverview();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
