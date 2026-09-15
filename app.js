/**
 * Carrboro Weather Live Dashboard
 * Client Application Logic
 * Pure Cream-White, Seamless, Borderless & Softly Muted Aesthetic
 * 8 blocks per day | Area Radar (~15%) | Cloud-Free Earth in Sunlight | Subtle Current Time Line
 */

(function () {
  "use strict";

  // Application State
  const state = {
    mode: "5day", // '5day' (40 blocks) | '3day' (24 blocks) | '24h' (24 hourly)
    city: "Carrboro",
    lat: 35.9101,
    lon: -79.0753,
    units: "fahrenheit", // 'fahrenheit' | 'celsius'
    currentData: null,
    hoveredCol: null,
    lockedCol: null
  };

  // Weather SVG Icons map (Muted pastel palette)
  const ICONS = {
    clear_day: `<svg viewBox="0 0 24 24" fill="none" stroke="#df9d6b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    clear_night: `<svg viewBox="0 0 24 24" fill="none" stroke="#7e92ab" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    partly_cloudy_day: `<svg viewBox="0 0 24 24" fill="none" stroke="#8cb8d0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>`,
    partly_cloudy_night: `<svg viewBox="0 0 24 24" fill="none" stroke="#9a8db0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>`,
    cloudy: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
    fog: `<svg viewBox="0 0 24 24" fill="none" stroke="#a0aec0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="10" x2="21" y2="10"></line><line x1="3" y1="14" x2="21" y2="14"></line><line x1="3" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="21" y2="6"></line></svg>`,
    rain_light: `<svg viewBox="0 0 24 24" fill="none" stroke="#7ea8bf" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
    rain: `<svg viewBox="0 0 24 24" fill="none" stroke="#689366" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
    rain_heavy: `<svg viewBox="0 0 24 24" fill="none" stroke="#446942" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
    snow: `<svg viewBox="0 0 24 24" fill="none" stroke="#9bb7cf" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>`,
    thunderstorm: `<svg viewBox="0 0 24 24" fill="none" stroke="#d49b4b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>`,
    hot_sun: `<svg viewBox="0 0 24 24" fill="none" stroke="#d47f78" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
  };

  function getContrastColor(hex) {
    if (!hex || hex[0] !== "#") return "#ffffff";
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    return lum > 0.60 ? "#2d3748" : "#ffffff";
  }

  // DOM Elements mapping
  const el = {
    navLocationTitle: document.getElementById("nav-location-title"),
    liveBadge: document.getElementById("live-badge"),
    liveBadgeText: document.getElementById("live-badge-text"),
    displayTitle: document.getElementById("display-title"),
    subCondition: document.getElementById("sub-condition"),
    subTemp: document.getElementById("sub-temp"),
    subFeels: document.getElementById("sub-feels"),
    subSun: document.getElementById("sub-sun"),
    subWind: document.getElementById("sub-wind"),
    subUpdated: document.getElementById("sub-updated"),
    gridLinesLayer: document.getElementById("grid-lines-layer"),
    rowsWrapper: document.getElementById("rows-wrapper"),
    daysBar: document.getElementById("days-bar"),
    metricsContainer: document.getElementById("metrics-container"),
    currentTimeIndicator: document.getElementById("current-time-indicator"),
    currentTimeBadge: document.getElementById("current-time-badge"),
    unitToggleBtn: document.getElementById("unit-toggle-btn"),
    unitLabel: document.getElementById("unit-label"),
    refreshBtn: document.getElementById("refresh-btn"),
    mode5day: document.getElementById("mode-5day"),
    mode3day: document.getElementById("mode-3day"),
    mode24h: document.getElementById("mode-24h"),
    tooltip: document.getElementById("weather-tooltip"),
    tooltipTime: document.getElementById("tooltip-time"),
    tooltipIconWrap: document.getElementById("tooltip-icon-wrap"),
    tooltipDesc: document.getElementById("tooltip-desc"),
    tooltipTemp: document.getElementById("tooltip-temp"),
    tooltipHum: document.getElementById("tooltip-hum"),
    tooltipPrecip: document.getElementById("tooltip-precip"),
    tooltipDaylight: document.getElementById("tooltip-daylight"),
    tooltipCloud: document.getElementById("tooltip-cloud"),
    searchModal: document.getElementById("search-modal"),
    openSearchBtn: document.getElementById("open-search-btn"),
    closeSearchBtn: document.getElementById("close-search-btn"),
    citySearchInput: document.getElementById("city-search-input"),
    searchResults: document.getElementById("search-results"),
    chipCondition: document.getElementById("chip-condition"),
    statTemp: document.getElementById("stat-temp"),
    statFeels: document.getElementById("stat-feels"),
    statHum: document.getElementById("stat-hum"),
    statPrecip: document.getElementById("stat-precip"),
    statWind: document.getElementById("stat-wind"),
    statCloud: document.getElementById("stat-cloud"),
    statRange: document.getElementById("stat-range"),
    statSun: document.getElementById("stat-sun"),
    radarLocationTag: document.getElementById("radar-location-tag"),
    radarPlayBtn: document.getElementById("radar-play-btn"),
    radarTimeTag: document.getElementById("radar-time-tag"),
    earthZoomBtn: document.getElementById("earth-zoom-btn"),
    earthContainer: document.getElementById("earth-container"),
    earthTerminatorTag: document.getElementById("earth-terminator-tag"),
    earthSubsolarInfo: document.getElementById("earth-subsolar-info"),
    earthModal: document.getElementById("earth-modal"),
    closeEarthBtn: document.getElementById("close-earth-btn"),
    solarContainer: document.getElementById("solar-container"),
    solarCanvas: document.getElementById("solar-system-canvas"),
    solarViewToggle: document.getElementById("solar-view-toggle"),
    solarTimeTag: document.getElementById("solar-time-tag"),
    solarModal: document.getElementById("solar-modal"),
    solarModalCanvas: document.getElementById("solar-modal-canvas"),
    closeSolarBtn: document.getElementById("close-solar-btn"),
    solarPlanetsTable: document.getElementById("solar-planets-table"),
    solarTooltip: document.getElementById("solar-tooltip"),
    solarTooltipName: document.getElementById("solar-tooltip-name"),
    solarTooltipSymbol: document.getElementById("solar-tooltip-symbol"),
    solarTooltipDist: document.getElementById("solar-tooltip-dist"),
    solarTooltipLon: document.getElementById("solar-tooltip-lon"),
    solarTooltipConst: document.getElementById("solar-tooltip-const"),
    solarTooltipPeriod: document.getElementById("solar-tooltip-period"),
    flightContainer: document.getElementById("flight-container"),
    flightCanvas: document.getElementById("flight-radar-canvas"),
    flightFilterBtn: document.getElementById("flight-filter-btn"),
    flightCountTag: document.getElementById("flight-count-tag"),
    flightModal: document.getElementById("flight-modal"),
    flightModalCanvas: document.getElementById("flight-modal-canvas"),
    closeFlightBtn: document.getElementById("close-flight-btn"),
    flightModalCenterName: document.getElementById("flight-modal-center-name"),
    flightTableSearch: document.getElementById("flight-table-search"),
    flightTableSummary: document.getElementById("flight-table-summary"),
    flightAircraftTable: document.getElementById("flight-aircraft-table"),
    flightTooltip: document.getElementById("flight-tooltip"),
    flightTooltipCallsign: document.getElementById("flight-tooltip-callsign"),
    flightTooltipCountry: document.getElementById("flight-tooltip-country"),
    flightTooltipAlt: document.getElementById("flight-tooltip-alt"),
    flightTooltipSpeed: document.getElementById("flight-tooltip-speed"),
    flightTooltipHdg: document.getElementById("flight-tooltip-hdg"),
    flightTooltipDist: document.getElementById("flight-tooltip-dist")
  };

  /**
   * Fetch live weather data
   */
  async function loadData() {
    try {
      const url = `/api/weather?city=${encodeURIComponent(state.city)}&lat=${state.lat}&lon=${state.lon}&units=${state.units}&view=${state.mode}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Failed to fetch weather");
      const data = await resp.json();

      state.currentData = data;
      render();
      radarManager.updateLocation(state.lat, state.lon, state.city);
      earthManager.render();
      flightManager.fetchFlights();
    } catch (err) {
      console.error("Error loading weather:", err);
    }
  }

  function format12HourTime(timeStr) {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM") || timeStr.includes("A") || timeStr.includes("P")) {
      return timeStr;
    }
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1].padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      return `${h}:${m} ${ampm}`;
    }
    return timeStr;
  }

  /**
   * Render the entire UI
   */
  function render() {
    const data = state.currentData;
    if (!data) return;

    const colCount = data.col_count || (data.intervals ? data.intervals.length : 40);
    document.documentElement.style.setProperty("--col-count", colCount);

    // 1. Navigation & Header
    el.displayTitle.textContent = data.title || `${state.city.toUpperCase()} WEATHER`;
    el.navLocationTitle.textContent = `${state.city}`;

    const now = new Date();
    el.subUpdated.textContent = `Live • ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

    const cur = data.current || {};
    const unit = cur.temperature_unit || "°F";
    el.subCondition.textContent = cur.condition || "Fair";
    el.subTemp.textContent = `${cur.temperature}${unit}`;
    el.subFeels.textContent = `${cur.apparent_temperature || cur.temperature}${unit}`;
    if (el.subSun) {
      const rise = format12HourTime(cur.sunrise || "06:55");
      const set = format12HourTime(cur.sunset || "19:28");
      el.subSun.textContent = `${rise} / ${set}`;
    }
    el.subWind.textContent = `${cur.wind_speed || 5} ${cur.wind_speed_unit || "mph"}`;

    // Stats panel
    if (el.chipCondition) el.chipCondition.textContent = cur.condition || "Fair";
    if (el.statTemp) el.statTemp.textContent = `${cur.temperature}${unit}`;
    if (el.statFeels) el.statFeels.textContent = `${cur.apparent_temperature || cur.temperature}${unit}`;
    if (el.statHum) el.statHum.textContent = `${cur.humidity}%`;
    if (el.statPrecip) el.statPrecip.textContent = `${cur.precipitation_chance || 0}%`;
    if (el.statWind) el.statWind.textContent = `${cur.wind_speed || 0} mph`;
    if (el.statCloud) el.statCloud.textContent = `${cur.cloud_cover || 0}%`;
    if (el.statRange) el.statRange.textContent = `${cur.temp_min}° - ${cur.temp_max}°${unit}`;
    if (el.statSun) el.statSun.textContent = `${cur.sunrise || "6:45A"} / ${cur.sunset || "7:30P"}`;
    if (el.radarLocationTag) el.radarLocationTag.textContent = state.city;

    // 2. Vertical Divider Lines across the card
    renderVerticalLines(data.divider_after_columns || [], colCount);

    // 3. Render 5 Metric Rows
    renderRows(data.rows, colCount);

    // 4. Render Days Bar at bottom
    renderDaysBar(data.days, colCount);

    // 5. Update subtle current time indicator line
    updateCurrentTimeIndicator();
  }

  /**
   * Update Subtle, Light Vertical Current Time Indicator Line
   */
  function updateCurrentTimeIndicator() {
    if (!el.currentTimeIndicator || !state.currentData) return;
    const data = state.currentData;
    const intervals = data.intervals || [];
    if (intervals.length === 0) {
      el.currentTimeIndicator.style.display = "none";
      return;
    }

    const now = new Date();
    const firstIntervalTime = new Date(intervals[0].datetime).getTime();

    // Total duration calculation
    let totalHours = 120; // 5 days default
    if (state.mode === "3day") totalHours = 72;
    else if (state.mode === "24h") totalHours = 24;

    const totalDurationMs = totalHours * 3600 * 1000;
    const elapsedMs = now.getTime() - firstIntervalTime;
    const pct = (elapsedMs / totalDurationMs) * 100;

    if (pct >= 0 && pct <= 100) {
      el.currentTimeIndicator.style.display = "block";
      el.currentTimeIndicator.style.left = `${pct.toFixed(2)}%`;
      if (el.currentTimeBadge) {
        el.currentTimeBadge.textContent = `NOW • ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      }
    } else if (pct > -2 && pct < 0) {
      el.currentTimeIndicator.style.display = "block";
      el.currentTimeIndicator.style.left = "0.5%";
      if (el.currentTimeBadge) {
        el.currentTimeBadge.textContent = `NOW • ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      }
    } else {
      el.currentTimeIndicator.style.display = "none";
    }
  }

  /**
   * Render vertical divider lines
   */
  function renderVerticalLines(dividerCols, colCount) {
    el.gridLinesLayer.innerHTML = "";
    dividerCols.forEach(colIdx => {
      const pct = ((colIdx + 1) / colCount) * 100;
      const line = document.createElement("div");
      line.className = "grid-line";
      line.style.left = `${pct}%`;
      el.gridLinesLayer.appendChild(line);
    });
  }

  /**
   * Render the 5 metric rows
   */
  function renderRows(rows, colCount) {
    el.rowsWrapper.innerHTML = "";

    rows.forEach((row, rowIdx) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "metric-row";
      rowDiv.dataset.rowId = row.id;

      // Label
      const labelDiv = document.createElement("div");
      labelDiv.className = "metric-label";
      labelDiv.textContent = row.label;
      rowDiv.appendChild(labelDiv);

      // Pill container with smooth continuous blended gradient
      const pillDiv = document.createElement("div");
      pillDiv.className = "metric-pill";
      pillDiv.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;

      if (row.gradient_css) {
        pillDiv.style.background = row.gradient_css;
      }

      // N Cells
      const nCells = row.values.length;
      for (let i = 0; i < nCells; i++) {
        const cell = document.createElement("div");
        cell.className = "pill-cell";
        cell.dataset.col = i;
        cell.dataset.row = rowIdx;
        cell.style.backgroundColor = "transparent";

        const valSpan = document.createElement("span");
        valSpan.className = "cell-value";

        if (row.id === "daylight") {
          valSpan.textContent = "";
          // Display the moon if it is visible in the sky at this time
          if (row.moon_data && row.moon_data[i]) {
            const moon = row.moon_data[i];
            if (moon.visible) {
              const moonEl = document.createElement("div");
              moonEl.className = "cell-moon";
              // If high in sky -> high, if low or setting -> low
              moonEl.style.bottom = `calc(3px + ${moon.altitude_pct} * (100% - 26px))`;
              moonEl.innerHTML = moon.svg;
              moonEl.title = `Moon: ${moon.phase_name} (${Math.round(moon.phase_fraction * 100)}% illuminated) • Altitude: ${Math.round(moon.altitude)}°`;
              cell.appendChild(moonEl);
            }
          }
        } else {
          const bgColor = row.colors[i] || "#f5f1ea";
          const textColor = (row.text_colors && row.text_colors[i]) ? row.text_colors[i] : getContrastColor(bgColor);

          cell.style.color = textColor;

          if (textColor === "#2d3748" || textColor === "#0f172a") {
            cell.classList.add("text-dark");
          } else {
            cell.classList.remove("text-dark");
          }

          valSpan.textContent = row.display_values[i] !== undefined ? row.display_values[i] : "";
        }
        cell.appendChild(valSpan);

        // Highlight state
        if (state.hoveredCol === i) {
          cell.classList.add("highlighted");
        }
        if (state.lockedCol === i) {
          cell.classList.add("selected");
        }

        // Hover events
        cell.addEventListener("mouseenter", (e) => onCellHover(i, e.target));
        cell.addEventListener("mouseleave", () => onCellLeave());
        cell.addEventListener("click", () => onCellClick(i));

        pillDiv.appendChild(cell);
      }

      rowDiv.appendChild(pillDiv);
      el.rowsWrapper.appendChild(rowDiv);
    });
  }

  /**
   * Render Days Bar at bottom
   */
  function renderDaysBar(days, colCount) {
    el.daysBar.innerHTML = "";
    el.daysBar.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;

    (days || []).forEach(day => {
      const item = document.createElement("div");
      item.className = "day-label-item";
      item.style.gridColumn = `span ${day.span}`;
      item.textContent = day.name;
      el.daysBar.appendChild(item);
    });
  }

  /**
   * Cell Hover handling
   */
  function onCellHover(colIndex, targetEl) {
    state.hoveredCol = colIndex;

    document.querySelectorAll(".pill-cell").forEach(c => {
      if (parseInt(c.dataset.col, 10) === colIndex) {
        c.classList.add("highlighted");
      } else {
        c.classList.remove("highlighted");
      }
    });

    showTooltip(colIndex, targetEl);
  }

  function onCellLeave() {
    state.hoveredCol = null;
    document.querySelectorAll(".pill-cell").forEach(c => c.classList.remove("highlighted"));

    if (state.lockedCol === null) {
      hideTooltip();
    }
  }

  function onCellClick(colIndex) {
    if (state.lockedCol === colIndex) {
      state.lockedCol = null;
      document.querySelectorAll(".pill-cell").forEach(c => c.classList.remove("selected"));
      hideTooltip();
    } else {
      state.lockedCol = colIndex;
      document.querySelectorAll(".pill-cell").forEach(c => {
        if (parseInt(c.dataset.col, 10) === colIndex) {
          c.classList.add("selected");
        } else {
          c.classList.remove("selected");
        }
      });
      const firstCell = document.querySelector(`.pill-cell[data-col="${colIndex}"]`);
      showTooltip(colIndex, firstCell);
    }
  }

  /**
   * Floating Tooltip logic
   */
  function showTooltip(colIndex, targetEl) {
    const data = state.currentData;
    if (!data) return;

    const interval = (data.intervals && data.intervals[colIndex]) || {};
    const rows = data.rows || [];

    el.tooltipTime.textContent = interval.period || `Interval ${colIndex + 1}`;
    el.tooltipDesc.textContent = interval.desc || "Clear";
    const iconSvg = ICONS[interval.icon] || ICONS.clear_day;
    el.tooltipIconWrap.innerHTML = iconSvg;

    const tempRow = rows.find(r => r.id === "temperature");
    const humRow = rows.find(r => r.id === "humidity");
    const precipRow = rows.find(r => r.id === "precipitation");
    const daylightRow = rows.find(r => r.id === "daylight");
    const cloudRow = rows.find(r => r.id === "cloud_cover");

    if (tempRow && tempRow.values[colIndex] !== undefined) {
      el.tooltipTemp.innerHTML = `<span class="metric-color-dot" style="background:${tempRow.colors[colIndex]}"></span> ${tempRow.display_values[colIndex]} ${tempRow.unit}`;
    }
    if (humRow && humRow.values[colIndex] !== undefined) {
      el.tooltipHum.innerHTML = `<span class="metric-color-dot" style="background:${humRow.colors[colIndex]}"></span> ${humRow.display_values[colIndex]}`;
    }
    if (precipRow && precipRow.values[colIndex] !== undefined) {
      el.tooltipPrecip.innerHTML = `<span class="metric-color-dot" style="background:${precipRow.colors[colIndex]}"></span> ${precipRow.display_values[colIndex]}`;
    }
    if (daylightRow && daylightRow.colors && daylightRow.colors[colIndex]) {
      const solarDesc = interval.solar_phase || "Daylight Continuum";
      const moon = (daylightRow.moon_data && daylightRow.moon_data[colIndex]) ? daylightRow.moon_data[colIndex] : (interval.moon || null);
      let moonInfo = "";
      if (moon) {
        if (moon.visible) {
          moonInfo = ` • 🌙 ${moon.phase_name} (${Math.round(moon.phase_fraction * 100)}% illum, ${Math.round(moon.altitude)}° alt)`;
        } else {
          moonInfo = ` • 🌙 Moon set`;
        }
      }
      el.tooltipDaylight.innerHTML = `<span class="metric-color-dot" style="background:${daylightRow.colors[colIndex]}"></span> ${solarDesc}${moonInfo}`;
    }
    if (cloudRow && cloudRow.values[colIndex] !== undefined) {
      el.tooltipCloud.innerHTML = `<span class="metric-color-dot" style="background:${cloudRow.colors[colIndex]}"></span> ${cloudRow.display_values[colIndex]}`;
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const pageX = rect.left + rect.width / 2 + window.scrollX;
      const pageY = rect.top + window.scrollY;

      el.tooltip.style.left = `${pageX}px`;
      el.tooltip.style.top = `${pageY}px`;
      el.tooltip.style.display = "block";
      el.tooltip.style.opacity = "1";
    }
  }

  function hideTooltip() {
    el.tooltip.style.opacity = "0";
    setTimeout(() => {
      if (state.hoveredCol === null && state.lockedCol === null) {
        el.tooltip.style.display = "none";
      }
    }, 140);
  }

  /**
   * Set View Mode
   */
  function setMode(newMode) {
    state.mode = newMode;
    [el.mode5day, el.mode3day, el.mode24h].forEach(btn => btn && btn.classList.remove("active"));

    if (newMode === "5day" && el.mode5day) el.mode5day.classList.add("active");
    if (newMode === "3day" && el.mode3day) el.mode3day.classList.add("active");
    if (newMode === "24h" && el.mode24h) el.mode24h.classList.add("active");

    state.hoveredCol = null;
    state.lockedCol = null;
    hideTooltip();
    loadData();
  }

  /**
   * Toggle Units (°F / °C)
   */
  function toggleUnits() {
    state.units = state.units === "fahrenheit" ? "celsius" : "fahrenheit";
    el.unitLabel.textContent = state.units === "fahrenheit" ? "°F" : "°C";
    loadData();
  }

  /**
   * Area Radar Map Manager (Leaflet + RainViewer) - Muted & Borderless
   */
  const radarManager = {
    map: null,
    marker: null,
    radarLayers: [],
    radarFrames: [],
    currentFrameIndex: -1,
    loopTimer: null,
    isPlaying: false,
    host: "https://tilecache.rainviewer.com",

    init: function () {
      const container = document.getElementById("radar-map");
      if (!container || typeof L === "undefined") return;

      try {
        this.map = L.map("radar-map", {
          center: [state.lat, state.lon],
          zoom: 6.5,
          zoomSnap: 0.5,
          zoomControl: false,
          attributionControl: false
        });

        // Soft, muted CartoDB Positron layer (cream/light gray)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 18,
          subdomains: "abcd"
        }).addTo(this.map);

        // Location marker (soft blue circle)
        this.marker = L.circleMarker([state.lat, state.lon], {
          radius: 5,
          color: "#3b82f6",
          fillColor: "#93c5fd",
          fillOpacity: 0.9,
          weight: 1.5
        }).addTo(this.map);

        setTimeout(() => {
          if (this.map) this.map.invalidateSize();
        }, 200);

        this.fetchRadarFrames();
      } catch (err) {
        console.warn("Could not initialize radar map:", err);
      }
    },

    updateLocation: function (lat, lon, cityName) {
      if (!this.map) return;
      this.map.setView([lat, lon], 6.5);
      if (this.marker) this.marker.setLatLng([lat, lon]);
      if (el.radarLocationTag) el.radarLocationTag.textContent = cityName;
    },

    fetchRadarFrames: async function () {
      try {
        const resp = await fetch("/api/radar");
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.host) this.host = data.host;

        const past = (data.radar && data.radar.past) ? data.radar.past : [];
        if (past.length === 0) return;

        this.radarFrames = past.slice(-8); // past 8 frames
        this.currentFrameIndex = this.radarFrames.length - 1;
        this.showFrame(this.currentFrameIndex);
      } catch (e) {
        console.warn("Radar data fetch error:", e);
      }
    },

    showFrame: function (index) {
      if (!this.map || !this.radarFrames || this.radarFrames.length === 0) return;
      if (index < 0 || index >= this.radarFrames.length) index = this.radarFrames.length - 1;
      this.currentFrameIndex = index;

      const frame = this.radarFrames[index];
      const tileUrl = `${this.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

      // Remove existing radar layers
      this.radarLayers.forEach(l => this.map.removeLayer(l));
      this.radarLayers = [];

      // Add new radar layer with soft muted opacity
      const layer = L.tileLayer(tileUrl, {
        opacity: 0.65,
        zIndex: 10
      });
      layer.addTo(this.map);
      this.radarLayers.push(layer);

      // Update time label
      if (el.radarTimeTag) {
        const diffFrames = this.radarFrames.length - 1 - index;
        if (diffFrames === 0) {
          el.radarTimeTag.textContent = "Live";
        } else {
          el.radarTimeTag.textContent = `-${diffFrames * 10}m`;
        }
      }
    },

    toggleLoop: function () {
      if (this.isPlaying) {
        this.stopLoop();
      } else {
        this.startLoop();
      }
    },

    startLoop: function () {
      if (this.radarFrames.length <= 1) return;
      this.isPlaying = true;
      if (el.radarPlayBtn) el.radarPlayBtn.textContent = "⏸ Pause";

      let idx = 0;
      this.showFrame(idx);
      this.loopTimer = setInterval(() => {
        idx = (idx + 1) % this.radarFrames.length;
        this.showFrame(idx);
      }, 550);
    },

    stopLoop: function () {
      this.isPlaying = false;
      if (this.loopTimer) clearInterval(this.loopTimer);
      if (el.radarPlayBtn) el.radarPlayBtn.textContent = "▶ Loop";
      this.showFrame(this.radarFrames.length - 1);
    }
  };

  /**
   * Earth in Sunlight View Manager (D3 Orthographic Globe, Cloud-Free, Cream White)
   */
  const earthManager = {
    landFeature: null,

    init: async function () {
      if (el.earthZoomBtn) {
        el.earthZoomBtn.addEventListener("click", () => this.openModal());
      }
      if (el.earthContainer) {
        el.earthContainer.addEventListener("click", () => this.openModal());
      }
      if (el.closeEarthBtn) {
        el.closeEarthBtn.addEventListener("click", () => this.closeModal());
      }
      if (el.earthModal) {
        el.earthModal.addEventListener("click", (e) => {
          if (e.target === el.earthModal) this.closeModal();
        });
      }

      // Load cloud-free land vector geometry
      try {
        const resp = await fetch("assets/land-110m.json");
        const topoData = await resp.json();
        if (typeof topojson !== "undefined") {
          this.landFeature = topojson.feature(topoData, topoData.objects.land);
          this.render();
        }
      } catch (e) {
        console.warn("Could not load land vectors:", e);
      }

      // Re-render globe every minute as sun moves across Earth
      setInterval(() => {
        this.render();
      }, 60 * 1000);
    },

    getSubsolarPoint: function () {
      const now = new Date();
      // Day of year
      const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const diff = now.getTime() - start.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

      // Solar declination (degrees, approx)
      const declination = -23.44 * Math.cos((2 * Math.PI / 365.25) * (dayOfYear + 10));

      // Subsolar longitude in degrees: at 12:00 UTC, longitude is 0
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
      let subsolarLon = -(utcHours - 12) * 15;
      while (subsolarLon < -180) subsolarLon += 360;
      while (subsolarLon > 180) subsolarLon -= 360;

      return { lat: declination, lon: subsolarLon };
    },

    drawGlobe: function (canvasId, width, height) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || typeof d3 === "undefined" || !this.landFeature) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.46;

      // Orthographic projection centered on Western Hemisphere (Americas: 75° W, 14° N)
      const projection = d3.geoOrthographic()
        .scale(radius)
        .translate([cx, cy])
        .rotate([75, -14, 0])
        .clipAngle(90);

      const path = d3.geoPath(projection, ctx);

      // 1. Globe Ocean Disk (soft warm cream-alabaster)
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = "#f3ede4";
      ctx.fill();

      // 2. Graticule lines (delicate, faint)
      ctx.beginPath();
      path(d3.geoGraticule10());
      ctx.strokeStyle = "rgba(195, 185, 172, 0.35)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 3. Landmasses (Cloud-Free, soft warm taupe-sand)
      ctx.beginPath();
      path(this.landFeature);
      ctx.fillStyle = "#ded4c5";
      ctx.fill();
      ctx.strokeStyle = "rgba(180, 168, 155, 0.35)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 4. Live Sunlight & Shadow Shading
      const subsolar = this.getSubsolarPoint();

      ctx.save();
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.clip();

      // Night side hemisphere: centered on antipode
      const antipodeLon = subsolar.lon > 0 ? subsolar.lon - 180 : subsolar.lon + 180;
      const antipodeLat = -subsolar.lat;
      const nightCircle = d3.geoCircle().center([antipodeLon, antipodeLat]).radius(90)();

      ctx.beginPath();
      path(nightCircle);
      ctx.fillStyle = "rgba(45, 55, 75, 0.16)"; // Soft muted twilight shade
      ctx.fill();

      // Day side hemisphere: soft warm golden sunlight wash
      const dayCircle = d3.geoCircle().center([subsolar.lon, subsolar.lat]).radius(90)();
      ctx.beginPath();
      path(dayCircle);
      ctx.fillStyle = "rgba(255, 246, 215, 0.28)"; // Soft golden sunlight glow
      ctx.fill();

      // Subsolar Point: where the sun is directly overhead at zenith
      const sunPos = projection([subsolar.lon, subsolar.lat]);
      if (sunPos) {
        ctx.beginPath();
        ctx.arc(sunPos[0], sunPos[1], 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#e59844";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sunPos[0], sunPos[1], 7.5, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(229, 152, 68, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Active Location Pin (Carrboro / searched city)
      const cityPos = projection([state.lon, state.lat]);
      if (cityPos) {
        ctx.beginPath();
        ctx.arc(cityPos[0], cityPos[1], 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cityPos[0], cityPos[1], 7, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.restore();

      // 5. Subtle globe rim outline
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = "rgba(180, 168, 155, 0.32)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    },

    render: function () {
      this.drawGlobe("earth-globe-canvas", 215, 215);
      if (el.earthModal && el.earthModal.classList.contains("open")) {
        this.drawGlobe("earth-modal-canvas", 440, 440);
      }

      const sub = this.getSubsolarPoint();
      const latStr = sub.lat >= 0 ? `${sub.lat.toFixed(1)}°N` : `${Math.abs(sub.lat).toFixed(1)}°S`;
      const lonStr = sub.lon < 0 ? `${Math.abs(sub.lon).toFixed(1)}°W` : `${sub.lon.toFixed(1)}°E`;

      if (el.earthTerminatorTag) {
        el.earthTerminatorTag.textContent = `Sun at ${lonStr}`;
      }
      if (el.earthSubsolarInfo) {
        el.earthSubsolarInfo.textContent = `Sun zenith: ${latStr}, ${lonStr} • Cloud-Free`;
      }
    },

    openModal: function () {
      if (el.earthModal) {
        el.earthModal.classList.add("open");
        setTimeout(() => {
          this.drawGlobe("earth-modal-canvas", 440, 440);
        }, 50);
      }
    },

    closeModal: function () {
      if (el.earthModal) {
        el.earthModal.classList.remove("open");
      }
    }
  };

  /**
   * Live Solar System View Manager (NASA JPL Keplerian Heliocentric Orbits)
   * Pure cream-alabaster disc aesthetic matching the Sunlight Earth chart
   */
  const solarManager = {
    viewMode: "all", // "all" (All 8 planets) or "inner" (Inner 4 planets)
    hoveredBody: null,
    renderedBodies: [],
    renderedModalBodies: [],

    planets: [
      {
        id: "mercury",
        name: "Mercury",
        symbol: "☿",
        a: 0.387099,
        e: 0.205630,
        L0: 252.2509,
        L1: 4.09233445,
        w0: 77.4561,
        w1: 0.00001556,
        periodStr: "88 days",
        speedStr: "47.4 km/s",
        radius: 2.3,
        modalRadius: 4.0,
        color: "#857f78",
        tag: "Rocky"
      },
      {
        id: "venus",
        name: "Venus",
        symbol: "♀",
        a: 0.723336,
        e: 0.006772,
        L0: 181.9798,
        L1: 1.60213034,
        w0: 131.5637,
        w1: 0.0000014,
        periodStr: "225 days",
        speedStr: "35.0 km/s",
        radius: 3.3,
        modalRadius: 5.4,
        color: "#eab308",
        tag: "Terrestrial"
      },
      {
        id: "earth",
        name: "Earth",
        symbol: "♁",
        a: 1.000003,
        e: 0.016709,
        L0: 100.4664,
        L1: 0.98560028,
        w0: 102.9373,
        w1: 0.000047,
        periodStr: "365.3 days",
        speedStr: "29.8 km/s",
        radius: 3.5,
        modalRadius: 5.8,
        color: "#3b82f6",
        hasMoon: true,
        tag: "Home Planet"
      },
      {
        id: "mars",
        name: "Mars",
        symbol: "♂",
        a: 1.523710,
        e: 0.093366,
        L0: 355.4330,
        L1: 0.52402068,
        w0: 336.0602,
        w1: 0.0000184,
        periodStr: "1.88 yrs",
        speedStr: "24.1 km/s",
        radius: 2.7,
        modalRadius: 4.6,
        color: "#ef4444",
        tag: "Red Planet"
      },
      {
        id: "jupiter",
        name: "Jupiter",
        symbol: "♃",
        a: 5.202887,
        e: 0.048498,
        L0: 34.3515,
        L1: 0.08308529,
        w0: 14.3312,
        w1: 0.0000078,
        periodStr: "11.86 yrs",
        speedStr: "13.1 km/s",
        radius: 5.6,
        modalRadius: 9.2,
        color: "#d97706",
        tag: "Gas Giant"
      },
      {
        id: "saturn",
        name: "Saturn",
        symbol: "♄",
        a: 9.536676,
        e: 0.055508,
        L0: 50.0774,
        L1: 0.03344414,
        w0: 93.0572,
        w1: 0.0000196,
        periodStr: "29.46 yrs",
        speedStr: "9.7 km/s",
        radius: 4.6,
        modalRadius: 7.8,
        color: "#ca8a04",
        hasRing: true,
        tag: "Ringed Giant"
      },
      {
        id: "uranus",
        name: "Uranus",
        symbol: "⛢",
        a: 19.18916,
        e: 0.046296,
        L0: 314.0550,
        L1: 0.01172834,
        w0: 173.0053,
        w1: 0.0000098,
        periodStr: "84.01 yrs",
        speedStr: "6.8 km/s",
        radius: 3.8,
        modalRadius: 6.4,
        color: "#06b6d4",
        tag: "Ice Giant"
      },
      {
        id: "neptune",
        name: "Neptune",
        symbol: "♆",
        a: 30.06992,
        e: 0.008988,
        L0: 304.3487,
        L1: 0.00598103,
        w0: 48.1203,
        w1: 0.0000076,
        periodStr: "164.8 yrs",
        speedStr: "5.4 km/s",
        radius: 3.8,
        modalRadius: 6.4,
        color: "#2563eb",
        tag: "Ice Giant"
      }
    ],

    zodiac: [
      { name: "Aries", symbol: "♈", min: 0, max: 30 },
      { name: "Taurus", symbol: "♉", min: 30, max: 60 },
      { name: "Gemini", symbol: "♊", min: 60, max: 90 },
      { name: "Cancer", symbol: "♋", min: 90, max: 120 },
      { name: "Leo", symbol: "♌", min: 120, max: 150 },
      { name: "Virgo", symbol: "♍", min: 150, max: 180 },
      { name: "Libra", symbol: "♎", min: 180, max: 210 },
      { name: "Scorpio", symbol: "♏", min: 210, max: 240 },
      { name: "Sagittarius", symbol: "♐", min: 240, max: 270 },
      { name: "Capricorn", symbol: "♑", min: 270, max: 300 },
      { name: "Aquarius", symbol: "♒", min: 300, max: 330 },
      { name: "Pisces", symbol: "♓", min: 330, max: 360 }
    ],

    getZodiac: function (deg) {
      const d = ((deg % 360) + 360) % 360;
      for (const z of this.zodiac) {
        if (d >= z.min && d < z.max) return z;
      }
      return this.zodiac[0];
    },

    getJulianDayFraction: function (date) {
      return (date.getTime() / 86400000) - 10957.5;
    },

    computePlanetState: function (planet, d) {
      const L = (planet.L0 + planet.L1 * d) % 360;
      const w = (planet.w0 + planet.w1 * d) % 360;
      let M = (L - w) % 360;
      if (M < 0) M += 360;
      const Mrad = M * (Math.PI / 180);
      let E = Mrad;
      for (let iter = 0; iter < 6; iter++) {
        E = E - (E - planet.e * Math.sin(E) - Mrad) / (1 - planet.e * Math.cos(E));
      }
      const xv = planet.a * (Math.cos(E) - planet.e);
      const yv = planet.a * Math.sqrt(1 - planet.e * planet.e) * Math.sin(E);
      const v = Math.atan2(yv, xv);
      const r = planet.a * (1 - planet.e * Math.cos(E));
      let lonDeg = (v * (180 / Math.PI) + w) % 360;
      if (lonDeg < 0) lonDeg += 360;
      return {
        r,
        lon: lonDeg,
        rad: lonDeg * (Math.PI / 180),
        zodiac: this.getZodiac(lonDeg)
      };
    },

    init: function () {
      if (el.solarContainer) {
        el.solarContainer.addEventListener("click", (e) => {
          if (e.target && (e.target.id === "solar-view-toggle" || e.target.closest("#solar-view-toggle"))) {
            return;
          }
          this.openModal();
        });
      }

      if (el.solarViewToggle) {
        el.solarViewToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          this.viewMode = this.viewMode === "all" ? "inner" : "all";
          el.solarViewToggle.textContent = this.viewMode === "all" ? "All 8" : "Inner 4";
          this.render();
        });
      }

      if (el.closeSolarBtn) {
        el.closeSolarBtn.addEventListener("click", () => this.closeModal());
      }

      if (el.solarModal) {
        el.solarModal.addEventListener("click", (e) => {
          if (e.target === el.solarModal) this.closeModal();
        });
      }

      this.setupHoverEvents("solar-system-canvas", false);
      this.setupHoverEvents("solar-modal-canvas", true);

      this.render();

      // Refresh every minute
      setInterval(() => {
        this.render();
      }, 60 * 1000);
    },

    setupHoverEvents: function (canvasId, isModal) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const bodies = isModal ? this.renderedModalBodies : this.renderedBodies;
        let found = null;
        let minDist = 14;

        for (const b of bodies) {
          const dist = Math.hypot(b.x - mx, b.y - my);
          if (dist < minDist) {
            minDist = dist;
            found = b;
          }
        }

        if (found !== this.hoveredBody) {
          this.hoveredBody = found;
          canvas.style.cursor = found ? "pointer" : "pointer";
          this.drawSolar(canvasId, canvas.clientWidth, canvas.clientHeight, isModal);
        }

        if (found && el.solarTooltip) {
          el.solarTooltipName.textContent = found.name;
          el.solarTooltipSymbol.textContent = found.symbol;
          el.solarTooltipDist.textContent = found.distStr;
          el.solarTooltipLon.textContent = found.lonStr;
          el.solarTooltipConst.textContent = found.constStr;
          el.solarTooltipPeriod.textContent = found.periodStr;

          el.solarTooltip.style.left = `${e.pageX}px`;
          el.solarTooltip.style.top = `${e.pageY}px`;
          el.solarTooltip.style.display = "block";
          el.solarTooltip.style.opacity = "1";
        } else if (el.solarTooltip) {
          el.solarTooltip.style.display = "none";
          el.solarTooltip.style.opacity = "0";
        }
      });

      canvas.addEventListener("mouseleave", () => {
        if (this.hoveredBody) {
          this.hoveredBody = null;
          this.drawSolar(canvasId, canvas.clientWidth, canvas.clientHeight, isModal);
        }
        if (el.solarTooltip) {
          el.solarTooltip.style.display = "none";
          el.solarTooltip.style.opacity = "0";
        }
      });
    },

    drawSolar: function (canvasId, width, height, isModal) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.46;

      // 1. Solar Celestial Disc (soft warm cream-alabaster matching Earth disk)
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fillStyle = "#f3ede4";
      ctx.fill();

      // Clip to circular disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.clip();

      // 2. Graticule / Zodiac radial sector indicators (subtle, delicate)
      for (let k = 0; k < 12; k++) {
        const rad = k * (Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * (R * 0.91), cy - Math.sin(rad) * (R * 0.91));
        ctx.lineTo(cx + Math.cos(rad) * R, cy - Math.sin(rad) * R);
        ctx.strokeStyle = "rgba(195, 185, 172, 0.45)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Subtle celestial axes
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.strokeStyle = "rgba(195, 185, 172, 0.22)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Vernal Equinox mark (0° Aries, right side)
      ctx.fillStyle = "#94a3b8";
      ctx.font = isModal ? "10px -apple-system, sans-serif" : "8px -apple-system, sans-serif";
      ctx.fillText("♈ 0°", cx + R - (isModal ? 28 : 22), cy - 3);

      // Distance scale mapper
      const viewMode = this.viewMode;
      function scaleRadius(au) {
        if (viewMode === "inner") {
          const norm = Math.min(au, 1.8) / 1.75;
          return R * (0.16 + norm * 0.78);
        } else {
          const p = Math.pow(Math.max(0.08, au) / 30.5, 0.46);
          return R * (0.12 + p * 0.84);
        }
      }

      // 3. Asteroid Belt (only in "all" mode)
      if (viewMode === "all") {
        const rMin = scaleRadius(2.2);
        const rMax = scaleRadius(3.2);
        ctx.beginPath();
        ctx.arc(cx, cy, rMax, 0, 2 * Math.PI);
        ctx.arc(cx, cy, rMin, 0, 2 * Math.PI, true);
        ctx.fillStyle = "rgba(225, 215, 200, 0.22)";
        ctx.fill();

        // Stippled dust grains
        ctx.fillStyle = "rgba(180, 168, 155, 0.4)";
        for (let i = 0; i < 48; i++) {
          const angle = (i * 0.1309) + 0.05;
          const dist = rMin + ((i * 37) % 100) / 100 * (rMax - rMin);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy - Math.sin(angle) * dist, 0.65, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Filter planets for view mode
      const activePlanets = viewMode === "inner" ? this.planets.slice(0, 4) : this.planets;
      const now = new Date();
      const d = this.getJulianDayFraction(now);

      const bodies = [];

      // Add Sun to bodies list for hover
      const sunR = isModal ? 8.5 : 5.2;
      bodies.push({
        id: "sun",
        name: "Sun",
        symbol: "☉",
        x: cx,
        y: cy,
        radius: sunR,
        distStr: "0.00 AU (Center)",
        lonStr: "--",
        constStr: "Sol",
        periodStr: "--"
      });

      // 4. Draw Orbit paths
      activePlanets.forEach(p => {
        const isHovered = this.hoveredBody && this.hoveredBody.id === p.id;
        ctx.beginPath();
        const steps = 64;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * 2 * Math.PI;
          const rTrue = (p.a * (1 - p.e * p.e)) / (1 + p.e * Math.cos(theta));
          const phi = theta + p.w0 * (Math.PI / 180);
          const dispR = scaleRadius(rTrue);
          const px = cx + dispR * Math.cos(phi);
          const py = cy - dispR * Math.sin(phi);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = isHovered ? "rgba(59, 130, 246, 0.6)" : "rgba(195, 185, 172, 0.45)";
        ctx.lineWidth = isHovered ? 1.4 : 0.75;
        ctx.stroke();
      });

      // 5. Draw Planets at Current Live Positions
      activePlanets.forEach(p => {
        const pState = this.computePlanetState(p, d);
        const dispR = scaleRadius(pState.r);
        const px = cx + dispR * Math.cos(pState.rad);
        const py = cy - dispR * Math.sin(pState.rad);

        const pRadius = isModal ? p.modalRadius : p.radius;
        const isHovered = this.hoveredBody && this.hoveredBody.id === p.id;

        bodies.push({
          id: p.id,
          name: p.name,
          symbol: p.symbol,
          x: px,
          y: py,
          radius: pRadius,
          distStr: `${pState.r.toFixed(2)} AU (${(pState.r * 149.6).toFixed(1)}M km)`,
          lonStr: `${pState.lon.toFixed(1)}°`,
          constStr: `${pState.zodiac.name} ${pState.zodiac.symbol}`,
          periodStr: p.periodStr
        });

        // Highlight ring on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(px, py, pRadius + 4, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }

        // Planet body
        ctx.beginPath();
        ctx.arc(px, py, pRadius, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Earth aura & Moon
        if (p.hasMoon) {
          ctx.beginPath();
          ctx.arc(px, py, pRadius + 1.8, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(59, 130, 246, 0.28)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Moon
          const moonAngle = (d * (2 * Math.PI / 29.530588)) % (2 * Math.PI);
          const moonDist = isModal ? 12 : 7;
          const mx = px + moonDist * Math.cos(moonAngle);
          const my = py - moonDist * Math.sin(moonAngle);
          ctx.beginPath();
          ctx.arc(mx, my, isModal ? 1.6 : 1.0, 0, 2 * Math.PI);
          ctx.fillStyle = "#94a3b8";
          ctx.fill();
        }

        // Saturn Rings
        if (p.hasRing) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(-0.35);
          ctx.beginPath();
          ctx.ellipse(0, 0, pRadius * 2.2, pRadius * 0.75, 0, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(202, 138, 4, 0.65)";
          ctx.lineWidth = isModal ? 1.8 : 1.1;
          ctx.stroke();
          ctx.restore();
        }

        // Labels in modal or on hover
        if (isModal || isHovered || (viewMode === "inner")) {
          ctx.fillStyle = "#334155";
          ctx.font = isModal ? "10px -apple-system, sans-serif" : "8.5px -apple-system, sans-serif";
          ctx.fillText(p.name, px + pRadius + 3, py + 3);
        }
      });

      // 6. Draw Sun at Center (warm glowing amber-gold, matching Sunlight subsolar point)
      const isSunHovered = this.hoveredBody && this.hoveredBody.id === "sun";
      const coronaGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, sunR * 2.8);
      coronaGrad.addColorStop(0, "#f59e0b");
      coronaGrad.addColorStop(0.35, "rgba(245, 158, 11, 0.38)");
      coronaGrad.addColorStop(1, "rgba(229, 152, 68, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 2.8, 0, 2 * Math.PI);
      ctx.fillStyle = coronaGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, 2 * Math.PI);
      ctx.fillStyle = "#e59844";
      ctx.fill();
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (isSunHovered) {
        ctx.beginPath();
        ctx.arc(cx, cy, sunR + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Restore clipping
      ctx.restore();

      // 7. Subtle Rim Outline (exact match to Earth globe rim)
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(180, 168, 155, 0.32)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      if (isModal) {
        this.renderedModalBodies = bodies;
      } else {
        this.renderedBodies = bodies;
      }
    },

    render: function () {
      this.drawSolar("solar-system-canvas", 215, 215, false);
      if (el.solarModal && el.solarModal.classList.contains("open")) {
        this.drawSolar("solar-modal-canvas", 420, 420, true);
        this.renderTable();
      }
    },

    renderTable: function () {
      if (!el.solarPlanetsTable) return;
      const now = new Date();
      const d = this.getJulianDayFraction(now);

      const html = this.planets.map(p => {
        const state = this.computePlanetState(p, d);
        return `
          <div class="solar-planet-pill" data-planet="${p.id}">
            <div class="solar-planet-pill-header">
              <span><span class="solar-planet-dot" style="background:${p.color}"></span>${p.name}</span>
              <span style="color:#64748b;font-weight:400">${p.symbol}</span>
            </div>
            <div class="solar-planet-pill-meta">
              <span>${state.r.toFixed(2)} AU</span>
              <span>${state.zodiac.name}</span>
            </div>
          </div>
        `;
      }).join("");

      el.solarPlanetsTable.innerHTML = html;
    },

    openModal: function () {
      if (el.solarModal) {
        el.solarModal.classList.add("open");
        setTimeout(() => {
          this.drawSolar("solar-modal-canvas", 420, 420, true);
          this.renderTable();
        }, 50);
      }
    },

    closeModal: function () {
      if (el.solarModal) {
        el.solarModal.classList.remove("open");
      }
      if (el.solarTooltip) {
        el.solarTooltip.style.display = "none";
        el.solarTooltip.style.opacity = "0";
      }
    }
  };

  /**
   * Live Airspace Flight Radar Manager (ADS-B 150-Mile Radius)
   * Pure cream-alabaster disc aesthetic matching the Sunlight and Solar System charts
   */
  const flightManager = {
    aircraft: [],
    radiusMiles: 150,
    filterMode: "all", // "all", "airborne", "low", "high"
    hoveredFlight: null,
    renderedFlights: [],
    renderedModalFlights: [],
    sweepAngle: 0,
    animFrame: null,
    searchFilter: "",

    // Regional reference navigation beacons/airports around NC/VA/SC
    airports: [
      { code: "RDU", name: "Raleigh-Durham", lat: 35.8776, lon: -78.7875 },
      { code: "GSO", name: "Piedmont Triad", lat: 36.0978, lon: -79.9373 },
      { code: "CLT", name: "Charlotte", lat: 35.2140, lon: -80.9431 },
      { code: "FAY", name: "Fayetteville", lat: 34.9912, lon: -78.8803 },
      { code: "RWI", name: "Rocky Mount", lat: 35.8563, lon: -77.8919 },
      { code: "DAN", name: "Danville", lat: 36.5725, lon: -79.3361 },
      { code: "ILM", name: "Wilmington", lat: 34.2706, lon: -77.9026 }
    ],

    init: function () {
      if (el.flightContainer) {
        el.flightContainer.addEventListener("click", (e) => {
          if (e.target && (e.target.id === "flight-filter-btn" || e.target.closest("#flight-filter-btn"))) {
            return;
          }
          this.openModal();
        });
      }

      if (el.flightFilterBtn) {
        el.flightFilterBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const modes = ["all", "airborne", "low", "high"];
          const labels = { all: "All", airborne: "Air", low: "<10k", high: ">25k" };
          const idx = (modes.indexOf(this.filterMode) + 1) % modes.length;
          this.filterMode = modes[idx];
          el.flightFilterBtn.textContent = labels[this.filterMode];
          this.render();
        });
      }

      if (el.closeFlightBtn) {
        el.closeFlightBtn.addEventListener("click", () => this.closeModal());
      }

      if (el.flightModal) {
        el.flightModal.addEventListener("click", (e) => {
          if (e.target === el.flightModal) this.closeModal();
        });
      }

      if (el.flightTableSearch) {
        el.flightTableSearch.addEventListener("input", (e) => {
          this.searchFilter = e.target.value.trim().toLowerCase();
          this.renderTable();
        });
      }

      this.setupHoverEvents("flight-radar-canvas", false);
      this.setupHoverEvents("flight-modal-canvas", true);

      this.fetchFlights();

      // Poll flights every 12 seconds
      setInterval(() => {
        this.fetchFlights();
      }, 12 * 1000);

      // Start gentle radar sweep animation
      this.startSweepAnimation();
    },

    startSweepAnimation: function () {
      let lastTime = performance.now();
      const loop = (now) => {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        // 1 revolution every 7 seconds
        this.sweepAngle = (this.sweepAngle + dt * (2 * Math.PI / 7)) % (2 * Math.PI);
        this.render();
        this.animFrame = requestAnimationFrame(loop);
      };
      this.animFrame = requestAnimationFrame(loop);
    },

    fetchFlights: async function () {
      try {
        const lat = state.lat || 35.9101;
        const lon = state.lon || -79.0753;
        const resp = await fetch(`/api/flights?lat=${lat}&lon=${lon}&radius=${this.radiusMiles}`);
        if (!resp.ok) return;
        const data = await resp.json();
        this.aircraft = data.aircraft || [];
        if (el.flightCountTag) {
          el.flightCountTag.textContent = `${this.aircraft.length} air`;
        }
        if (el.flightModalCenterName) {
          el.flightModalCenterName.textContent = state.city || "Carrboro, NC";
        }
        this.render();
        if (el.flightModal && el.flightModal.classList.contains("open")) {
          this.renderTable();
        }
      } catch (err) {
        console.warn("Could not fetch flight data:", err);
      }
    },

    setupHoverEvents: function (canvasId, isModal) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const flights = isModal ? this.renderedModalFlights : this.renderedFlights;
        let found = null;
        let minDist = 14;

        for (const f of flights) {
          const dist = Math.hypot(f.x - mx, f.y - my);
          if (dist < minDist) {
            minDist = dist;
            found = f;
          }
        }

        if (found !== this.hoveredFlight) {
          this.hoveredFlight = found;
          canvas.style.cursor = found ? "pointer" : "pointer";
        }

        if (found && el.flightTooltip) {
          el.flightTooltipCallsign.textContent = found.callsign;
          el.flightTooltipCountry.textContent = found.country;
          el.flightTooltipAlt.textContent = found.on_ground ? "On Ground" : `${found.alt_ft.toLocaleString()} ft`;
          el.flightTooltipSpeed.textContent = `${found.speed_kts} kts (${Math.round(found.speed_kts * 1.15078)} mph)`;
          el.flightTooltipHdg.textContent = `${found.heading}° ${this.getCompassDir(found.heading)}`;
          el.flightTooltipDist.textContent = `${found.dist_mi} mi from ${state.city || "Carrboro"}`;

          el.flightTooltip.style.left = `${e.pageX}px`;
          el.flightTooltip.style.top = `${e.pageY}px`;
          el.flightTooltip.style.display = "block";
          el.flightTooltip.style.opacity = "1";
        } else if (el.flightTooltip) {
          el.flightTooltip.style.display = "none";
          el.flightTooltip.style.opacity = "0";
        }
      });

      canvas.addEventListener("mouseleave", () => {
        if (this.hoveredFlight) {
          this.hoveredFlight = null;
        }
        if (el.flightTooltip) {
          el.flightTooltip.style.display = "none";
          el.flightTooltip.style.opacity = "0";
        }
      });
    },

    getCompassDir: function (deg) {
      const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
      return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
    },

    drawRadar: function (canvasId, width, height, isModal) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.46;

      // 1. Radar Disc background (soft warm cream-alabaster matching Sunlight & Solar System)
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fillStyle = "#f3ede4";
      ctx.fill();

      // Clip to circular disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.clip();

      // 2. Concentric Range Rings (50 mi, 100 mi, 150 mi)
      const rings = [50, 100, 150];
      rings.forEach(miles => {
        const ringR = (miles / 150) * R;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(195, 185, 172, 0.45)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Label
        if (miles < 150) {
          ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
          ctx.font = isModal ? "10px -apple-system, sans-serif" : "7.5px -apple-system, sans-serif";
          ctx.fillText(`${miles}m`, cx + 3, cy - ringR + (isModal ? 12 : 9));
        }
      });

      // 3. Radial Compass Spokes & Axes
      for (let k = 0; k < 12; k++) {
        const rad = k * (Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * (R * 0.92), cy + Math.sin(rad) * (R * 0.92));
        ctx.lineTo(cx + Math.cos(rad) * R, cy + Math.sin(rad) * R);
        ctx.strokeStyle = "rgba(195, 185, 172, 0.45)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Compass Axes (N-S, E-W)
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.strokeStyle = "rgba(195, 185, 172, 0.25)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // North Indicator
      ctx.fillStyle = "#e11d48";
      ctx.font = isModal ? "bold 10px -apple-system, sans-serif" : "bold 8px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", cx, cy - R + (isModal ? 14 : 11));
      ctx.textAlign = "start";

      // 4. Rotating Radar Sweep Beam
      const sweepAngle = this.sweepAngle;
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      sweepGrad.addColorStop(0, "rgba(59, 130, 246, 0.16)");
      sweepGrad.addColorStop(1, "rgba(59, 130, 246, 0.01)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweepAngle - 0.45, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sweep leading line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * R, cy + Math.sin(sweepAngle) * R);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // 5. Regional Reference Airports (RDU, GSO, CLT, FAY, RWI, DAN)
      const centerLat = state.lat || 35.9101;
      const centerLon = state.lon || -79.0753;
      const radLat = centerLat * (Math.PI / 180);

      this.airports.forEach(apt => {
        const dlat = (apt.lat - centerLat) * (Math.PI / 180);
        const dlon = (apt.lon - centerLon) * (Math.PI / 180);
        const a = Math.sin(dlat / 2)**2 + Math.cos(radLat) * Math.cos(apt.lat * Math.PI / 180) * Math.sin(dlon / 2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distMi = 3958.8 * c;

        if (distMi <= 150) {
          const y = Math.sin(dlon) * Math.cos(apt.lat * Math.PI / 180);
          const x = Math.cos(radLat) * Math.sin(apt.lat * Math.PI / 180) - Math.sin(radLat) * Math.cos(apt.lat * Math.PI / 180) * Math.cos(dlon);
          const bearing = (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);

          const rPix = (distMi / 150) * R;
          const ax = cx + rPix * Math.sin(bearing);
          const ay = cy - rPix * Math.cos(bearing);

          // Draw tiny runway cross marker
          ctx.strokeStyle = "rgba(100, 116, 139, 0.45)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax - 2.5, ay); ctx.lineTo(ax + 2.5, ay);
          ctx.moveTo(ax, ay - 2.5); ctx.lineTo(ax, ay + 2.5);
          ctx.stroke();

          // Airport label
          ctx.fillStyle = "#64748b";
          ctx.font = isModal ? "9px -apple-system, sans-serif" : "7px -apple-system, sans-serif";
          ctx.fillText(apt.code, ax + 3, ay + 3);
        }
      });

      // 6. Draw Aircraft
      const rendered = [];
      const filter = this.filterMode;

      this.aircraft.forEach(f => {
        if (filter === "airborne" && f.on_ground) return;
        if (filter === "low" && f.alt_ft >= 10000) return;
        if (filter === "high" && f.alt_ft <= 25000) return;

        const bearingRad = f.bearing * (Math.PI / 180);
        const rPix = (f.dist_mi / 150) * R;
        const fx = cx + rPix * Math.sin(bearingRad);
        const fy = cy - rPix * Math.cos(bearingRad);

        const isHovered = this.hoveredFlight && this.hoveredFlight.icao === f.icao;
        rendered.push({ ...f, x: fx, y: fy });

        // Altitude color coding
        let flightColor = "#0284c7"; // Mid altitude
        if (f.on_ground) flightColor = "#94a3b8";
        else if (f.alt_ft < 10000) flightColor = "#059669"; // Low
        else if (f.alt_ft > 25000) flightColor = "#4f46e5"; // High

        // Hover highlight ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(fx, fy, isModal ? 10 : 7, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        // Draw Directional Airplane Silhouette
        ctx.save();
        ctx.translate(fx, fy);
        const headingRad = (f.heading - 90) * (Math.PI / 180);
        ctx.rotate(headingRad);

        const s = isModal ? 1.4 : 0.95;
        ctx.fillStyle = flightColor;
        ctx.beginPath();
        // Nose
        ctx.moveTo(5 * s, 0);
        // Wing right
        ctx.lineTo(-2 * s, 4.5 * s);
        // Wing taper
        ctx.lineTo(-1 * s, 1.5 * s);
        // Tail body
        ctx.lineTo(-4.5 * s, 1.2 * s);
        // Tail fin right
        ctx.lineTo(-6 * s, 2.8 * s);
        // Tail back
        ctx.lineTo(-5.5 * s, 0);
        // Tail fin left
        ctx.lineTo(-6 * s, -2.8 * s);
        // Tail body left
        ctx.lineTo(-4.5 * s, -1.2 * s);
        // Wing taper left
        ctx.lineTo(-1 * s, -1.5 * s);
        // Wing left
        ctx.lineTo(-2 * s, -4.5 * s);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Speed Vector line ahead of airplane
        if (f.speed_kts > 50) {
          const vectorLen = Math.min(18, Math.max(5, f.speed_kts / 35)) * (isModal ? 1.4 : 1);
          const hRad = f.heading * (Math.PI / 180);
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx + Math.sin(hRad) * vectorLen, fy - Math.cos(hRad) * vectorLen);
          ctx.strokeStyle = isHovered ? "rgba(59, 130, 246, 0.8)" : "rgba(100, 116, 139, 0.35)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Flight label in modal or when hovered
        if (isModal || isHovered) {
          ctx.fillStyle = "#1e293b";
          ctx.font = isModal ? "bold 9px -apple-system, sans-serif" : "bold 7.5px -apple-system, sans-serif";
          ctx.fillText(f.callsign, fx + 5, fy - 3);

          if (isModal) {
            ctx.fillStyle = "#64748b";
            ctx.font = "8px -apple-system, sans-serif";
            const altK = (f.alt_ft / 1000).toFixed(0);
            ctx.fillText(`${altK}k • ${f.speed_kts}kt`, fx + 5, fy + 7);
          }
        }
      });

      // 7. Center Observer Pin (Carrboro / Selected City)
      ctx.beginPath();
      ctx.arc(cx, cy, isModal ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, isModal ? 9 : 6.5, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center label
      ctx.fillStyle = "#1e293b";
      ctx.font = isModal ? "bold 10px -apple-system, sans-serif" : "bold 7.5px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(state.city || "Carrboro", cx, cy + (isModal ? 16 : 12));
      ctx.textAlign = "start";

      // Restore unclip
      ctx.restore();

      // 8. Outer Rim Outline (exact match to Sunlight & Solar System)
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(180, 168, 155, 0.32)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      if (isModal) {
        this.renderedModalFlights = rendered;
      } else {
        this.renderedFlights = rendered;
      }
    },

    render: function () {
      this.drawRadar("flight-radar-canvas", 215, 215, false);
      if (el.flightModal && el.flightModal.classList.contains("open")) {
        this.drawRadar("flight-modal-canvas", 420, 420, true);
      }
    },

    renderTable: function () {
      if (!el.flightAircraftTable) return;
      const q = this.searchFilter;
      const filtered = this.aircraft.filter(f => {
        if (!q) return true;
        return f.callsign.toLowerCase().includes(q) ||
               f.country.toLowerCase().includes(q) ||
               String(f.alt_ft).includes(q);
      });

      if (el.flightTableSummary) {
        el.flightTableSummary.textContent = `${filtered.length} of ${this.aircraft.length} aircraft`;
      }

      const html = filtered.slice(0, 40).map(f => {
        let dotColor = "#0284c7";
        if (f.on_ground) dotColor = "#94a3b8";
        else if (f.alt_ft < 10000) dotColor = "#059669";
        else if (f.alt_ft > 25000) dotColor = "#4f46e5";

        return `
          <div class="flight-row-item" data-icao="${f.icao}">
            <div class="flight-row-callsign">
              <span class="flight-row-dot" style="background:${dotColor}"></span>
              <span>${f.callsign}</span>
              <span style="font-size:10px;font-weight:400;color:#64748b">(${f.country})</span>
            </div>
            <div class="flight-row-metrics">
              <span>${f.on_ground ? "Ground" : `${f.alt_ft.toLocaleString()} ft`}</span>
              <span>${f.speed_kts} kts</span>
              <span>${f.heading}° ${this.getCompassDir(f.heading)}</span>
              <span>${f.dist_mi} mi</span>
            </div>
          </div>
        `;
      }).join("");

      el.flightAircraftTable.innerHTML = html;
    },

    openModal: function () {
      if (el.flightModal) {
        el.flightModal.classList.add("open");
        setTimeout(() => {
          this.drawRadar("flight-modal-canvas", 420, 420, true);
          this.renderTable();
        }, 50);
      }
    },

    closeModal: function () {
      if (el.flightModal) {
        el.flightModal.classList.remove("open");
      }
      if (el.flightTooltip) {
        el.flightTooltip.style.display = "none";
        el.flightTooltip.style.opacity = "0";
      }
    }
  };

  /**
   * City Search Auto-complete
   */
  let searchTimeout = null;
  function onSearchInput(e) {
    const val = e.target.value.trim();
    clearTimeout(searchTimeout);
    if (val.length < 2) {
      el.searchResults.innerHTML = "";
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        const data = await resp.json();
        renderSearchResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 250);
  }

  function renderSearchResults(results) {
    el.searchResults.innerHTML = "";
    if (results.length === 0) {
      el.searchResults.innerHTML = `<div style="padding:10px; color:#94a3b8; text-align:center; font-size:11.5px;">No locations found</div>`;
      return;
    }

    results.forEach(loc => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <span class="search-result-name">${loc.name}</span>
        <span class="search-result-region">${loc.region ? loc.region + ", " : ""}${loc.country}</span>
      `;
      item.addEventListener("click", () => {
        selectLocation(loc.name, loc.latitude, loc.longitude);
      });
      el.searchResults.appendChild(item);
    });
  }

  function selectLocation(name, lat, lon) {
    state.city = name;
    state.lat = lat;
    state.lon = lon;
    closeSearchModal();
    loadData();
  }

  function openSearchModal() {
    el.searchModal.classList.add("open");
    el.citySearchInput.value = "";
    el.searchResults.innerHTML = "";
    setTimeout(() => el.citySearchInput.focus(), 50);
  }

  function closeSearchModal() {
    el.searchModal.classList.remove("open");
  }

  /**
   * Event Listeners Registration
   */
  function initEvents() {
    // Mode Buttons
    if (el.mode5day) el.mode5day.addEventListener("click", () => setMode("5day"));
    if (el.mode3day) el.mode3day.addEventListener("click", () => setMode("3day"));
    if (el.mode24h) el.mode24h.addEventListener("click", () => setMode("24h"));

    // Unit toggle & refresh
    if (el.unitToggleBtn) el.unitToggleBtn.addEventListener("click", toggleUnits);
    if (el.refreshBtn) {
      el.refreshBtn.addEventListener("click", () => {
        el.refreshBtn.style.transform = "rotate(360deg)";
        loadData().finally(() => {
          setTimeout(() => el.refreshBtn.style.transform = "none", 400);
        });
      });
    }

    // Radar Loop toggle
    if (el.radarPlayBtn) {
      el.radarPlayBtn.addEventListener("click", () => radarManager.toggleLoop());
    }

    // Search modal
    if (el.openSearchBtn) el.openSearchBtn.addEventListener("click", openSearchModal);
    if (el.closeSearchBtn) el.closeSearchBtn.addEventListener("click", closeSearchModal);
    if (el.citySearchInput) el.citySearchInput.addEventListener("input", onSearchInput);
    if (el.searchModal) {
      el.searchModal.addEventListener("click", (e) => {
        if (e.target === el.searchModal) closeSearchModal();
      });
    }

    // Suggestion chips
    document.querySelectorAll(".chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const city = btn.dataset.city;
        const lat = parseFloat(btn.dataset.lat);
        const lon = parseFloat(btn.dataset.lon);
        selectLocation(city, lat, lon);
      });
    });

    // Close modals on Escape key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSearchModal();
        earthManager.closeModal();
        solarManager.closeModal();
        flightManager.closeModal();
        state.lockedCol = null;
        document.querySelectorAll(".pill-cell").forEach(c => c.classList.remove("selected"));
        hideTooltip();
      }
    });

    // Resize event to redraw time indicator and invalidate map/canvas
    window.addEventListener("resize", () => {
      updateCurrentTimeIndicator();
      if (radarManager.map) radarManager.map.invalidateSize();
      earthManager.render();
      solarManager.render();
      flightManager.render();
    });

    // Auto-update current time line every 30 seconds
    setInterval(updateCurrentTimeIndicator, 30000);

    // Auto-refresh weather data every 5 minutes
    setInterval(loadData, 5 * 60 * 1000);

    // Auto-refresh radar data every 3 minutes
    setInterval(() => {
      radarManager.fetchRadarFrames();
    }, 3 * 60 * 1000);
  }

  // Initialization
  initEvents();
  radarManager.init();
  earthManager.init();
  solarManager.init();
  flightManager.init();
  loadData();

})();
