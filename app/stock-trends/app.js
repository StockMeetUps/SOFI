(function () {
  "use strict";

  const TI = window.TechIndicators;
  const Analysis = window.StockAnalysis;
  const DataSvc = window.StockDataService;
  const UNIVERSE = window.STOCK_UNIVERSE.SEGMENTS;
  const TT_COLS = Analysis.TREND_TEMPLATE_COLUMNS;
  const HEATMAP_COLS = 11;

  const DISPLAY_BARS = 420;

  function sliceLast(series, n) {
    const len = series.close.length;
    const start = Math.max(0, len - n);
    return {
      dates: series.dates.slice(start),
      open: series.open.slice(start),
      high: series.high.slice(start),
      low: series.low.slice(start),
      close: series.close.slice(start),
      volume: series.volume.slice(start),
    };
  }

  function alignIndicators(fullLen, slicedLen, arr) {
    const offset = fullLen - slicedLen;
    return arr.slice(offset);
  }

  let priceChart;
  let rsiChart;
  let dmiChart;
  let sqChart;

  const state = {
    rawBySymbol: {},
    lastAnalysis: null,
  };

  function buildSelectOptions() {
    const sel = document.getElementById("symbol-select");
    sel.innerHTML = "";
    for (const seg of UNIVERSE) {
      const og = document.createElement("optgroup");
      og.label = seg.label;
      for (const s of seg.stocks) {
        const opt = document.createElement("option");
        opt.value = s.yahooSuffix;
        opt.textContent = `${s.symbol} — ${s.name}`;
        og.appendChild(opt);
      }
      sel.appendChild(og);
    }
    sel.value = "MSFT";
  }

  function fmtDate(d) {
    return d.toISOString().slice(0, 10);
  }

  function renderTrendTemplate(flagsLast) {
    const f = flagsLast;
    const rows = [
      ["Price > 150-day MA", f.priceAbove150],
      ["Price > 200-day MA", f.priceAbove200],
      ["150-day MA > 200-day MA", f.ma150Above200],
      ["200-day MA rising (~1 month)", f.ma200RisingMonth],
      ["50-day MA > 150-day MA", f.ma50Above150],
      ["50-day MA > 200-day MA", f.ma50Above200],
      ["Price above 50-day MA", f.priceAbove50],
      ["Price ≥ 25% above 52-week low", f.above25PctFromLow],
      ["Within 25% of 52-week high", f.within25PctOfHigh],
    ];
    const grid = document.getElementById("template-checklist");
    grid.innerHTML = rows
      .map(
        ([label, ok]) => `
      <div class="template-row">
        <span class="dot ${ok ? "ok" : "fail"}"></span>
        <span class="label">${label}</span>
      </div>`
      )
      .join("");
    document.getElementById("template-score").textContent = `${f.score} / 9`;
  }

  function destroyCharts() {
    [priceChart, rsiChart, dmiChart, sqChart].forEach((c) => {
      if (c) c.destroy();
    });
    priceChart = rsiChart = dmiChart = sqChart = null;
  }

  function computeAll(series) {
    const close = series.close;
    const high = series.high;
    const low = series.low;

    const bb = TI.bollinger(close, 20, 2);
    const st = TI.supertrend(high, low, close, 10, 3);
    const { flags } = Analysis.trendTemplateFlags(series);
    const rsiPack = Analysis.rsiWithSignal(close, 14, 3);
    const dmi = TI.dmiAdx(high, low, close, 14);
    const sq = TI.squeezeMomentum(high, low, close, 20, 2, 20, 1.5);
    const markers = Analysis.computeSignals(series, bb, st);

    return {
      bb,
      st,
      flags,
      rsi: rsiPack.rsi,
      rsiSignal: rsiPack.signal,
      dmi,
      sq,
      markers,
    };
  }

  function drawCharts(series, calc) {
    const s = sliceLast(series, DISPLAY_BARS);
    const fullLen = series.close.length;
    const slen = s.close.length;

    const bbU = alignIndicators(fullLen, slen, calc.bb.upper);
    const bbL = alignIndicators(fullLen, slen, calc.bb.lower);
    const bbM = alignIndicators(fullLen, slen, calc.bb.basis);
    const stLine = alignIndicators(fullLen, slen, calc.st.line);
    const stTrend = alignIndicators(fullLen, slen, calc.st.trend);
    const rsi = alignIndicators(fullLen, slen, calc.rsi);
    const rsiSig = alignIndicators(fullLen, slen, calc.rsiSignal);
    const pdi = alignIndicators(fullLen, slen, calc.dmi.plusDI);
    const mdi = alignIndicators(fullLen, slen, calc.dmi.minusDI);
    const adx = alignIndicators(fullLen, slen, calc.dmi.adx);
    const sqMom = alignIndicators(fullLen, slen, calc.sq.momentum);
    const sqOn = alignIndicators(fullLen, slen, calc.sq.squeezeOn);

    const labels = s.dates.map(fmtDate);

    const offset = fullLen - slen;
    const markers = calc.markers.filter((m) => m.index >= offset);
    const buyPts = new Array(slen).fill(null);
    const sellPts = new Array(slen).fill(null);
    markers.forEach((m) => {
      const xi = m.index - offset;
      if (xi < 0 || xi >= slen) return;
      if (m.type === "buy") buyPts[xi] = s.close[xi];
      else sellPts[xi] = s.close[xi];
    });

    destroyCharts();

    const commonOpts = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: "#9ca3af" } },
      },
      scales: {
        x: {
          ticks: { maxTicksLimit: 8, color: "#64748b" },
          grid: { color: "rgba(148,163,184,0.12)" },
        },
      },
    };

    const ctxP = document.getElementById("chart-price").getContext("2d");
    priceChart = new Chart(ctxP, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Close",
            data: s.close,
            borderColor: "#e2e8f0",
            borderWidth: 1.2,
            pointRadius: 0,
            tension: 0.05,
          },
          {
            label: "BB Upper",
            data: bbU,
            borderColor: "rgba(56,189,248,0.5)",
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: "BB Lower",
            data: bbL,
            borderColor: "rgba(56,189,248,0.5)",
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: "BB Basis",
            data: bbM,
            borderColor: "rgba(148,163,184,0.5)",
            borderDash: [4, 4],
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: "Supertrend",
            data: stLine,
            borderWidth: 2,
            pointRadius: 0,
            segment: {
              borderColor: (ctx) => {
                const i = ctx.p0DataIndex;
                const t = stTrend[i];
                return t === 1 ? "#22c55e" : "#ef4444";
              },
            },
          },
          {
            label: "Buy",
            data: buyPts,
            showLine: false,
            pointRadius: 7,
            pointHoverRadius: 9,
            pointBackgroundColor: "#22c55e",
            pointBorderColor: "#fff",
            pointBorderWidth: 1,
          },
          {
            label: "Sell",
            data: sellPts,
            showLine: false,
            pointRadius: 7,
            pointHoverRadius: 9,
            pointBackgroundColor: "#ef4444",
            pointBorderColor: "#fff",
            pointBorderWidth: 1,
          },
        ],
      },
      options: {
        ...commonOpts,
        scales: {
          ...commonOpts.scales,
          y: {
            ticks: { color: "#64748b" },
            grid: { color: "rgba(148,163,184,0.12)" },
          },
        },
      },
    });

    const ctxR = document.getElementById("chart-rsi").getContext("2d");
    rsiChart = new Chart(ctxR, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "RSI 14",
            data: rsi,
            borderColor: "#a78bfa",
            pointRadius: 0,
            borderWidth: 1.5,
            spanGaps: true,
          },
          {
            label: "Signal",
            data: rsiSig,
            borderColor: "#fbbf24",
            pointRadius: 0,
            borderWidth: 1,
            spanGaps: true,
          },
        ],
      },
      options: {
        ...commonOpts,
        scales: {
          ...commonOpts.scales,
          y: {
            min: 0,
            max: 100,
            ticks: { color: "#64748b" },
            grid: { color: "rgba(148,163,184,0.12)" },
          },
        },
      },
    });

    const ctxD = document.getElementById("chart-dmi").getContext("2d");
    dmiChart = new Chart(ctxD, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "+DI",
            data: pdi,
            borderColor: "#3b82f6",
            pointRadius: 0,
            spanGaps: true,
          },
          {
            label: "-DI",
            data: mdi,
            borderColor: "#f97316",
            pointRadius: 0,
            spanGaps: true,
          },
          {
            label: "ADX",
            data: adx,
            borderColor: "#e5e7eb",
            borderWidth: 2,
            pointRadius: 0,
            spanGaps: true,
          },
        ],
      },
      options: {
        ...commonOpts,
        scales: {
          ...commonOpts.scales,
          y: {
            ticks: { color: "#64748b" },
            grid: { color: "rgba(148,163,184,0.12)" },
          },
        },
      },
    });

    const colors = sqMom.map((v, i) => {
      if (!Number.isFinite(v)) return "transparent";
      const prev = i > 0 ? sqMom[i - 1] : v;
      const up = v >= 0;
      const accel = Math.abs(v) >= Math.abs(prev);
      if (up) return accel ? "rgba(74,222,128,0.85)" : "rgba(21,128,61,0.75)";
      return accel ? "rgba(248,113,113,0.9)" : "rgba(185,28,28,0.75)";
    });

    const ctxS = document.getElementById("chart-squeeze").getContext("2d");
    sqChart = new Chart(ctxS, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Squeeze momentum",
            data: sqMom,
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        ...commonOpts,
        scales: {
          ...commonOpts.scales,
          y: {
            ticks: { color: "#64748b" },
            grid: { color: "rgba(148,163,184,0.12)" },
          },
        },
      },
    });

    document.getElementById("squeeze-note").textContent = sqOn[slen - 1]
      ? "Squeeze ON (BB inside Keltner) — volatility compression."
      : "Squeeze released — expansion phase.";
  }

  async function loadSymbol(symbol) {
    document.getElementById("status-text").textContent = `Loading ${symbol}…`;
    const na = document.getElementById("na-banner");
    na.classList.remove("visible");

    let series;
    try {
      series = await DataSvc.fetchDailyChart(symbol);
    } catch (e) {
      na.textContent =
        "Could not load live quotes (network/CORS). Try another network or host behind a small proxy.";
      na.classList.add("visible");
      document.getElementById("status-text").textContent = "Load failed.";
      throw e;
    }

    state.rawBySymbol[symbol] = series;
    const calc = computeAll(series);
    state.lastAnalysis = { series, calc };

    const last = series.close.length - 1;
    const tmpl = calc.flags[last];

    renderTrendTemplate(tmpl);

    const st = calc.st.trend[last];
    const rsiV = calc.rsi[last];
    const adxV = calc.dmi.adx[last];
    const squeezeOn = calc.sq.squeezeOn[last];

    document.getElementById("narr-buy").textContent = Analysis.buildNarrativeBuy(
      last,
      tmpl,
      st,
      rsiV,
      adxV,
      squeezeOn
    );
    document.getElementById("narr-sell").textContent = Analysis.buildNarrativeSell(last, tmpl, st, rsiV);

    drawCharts(series, calc);

    const rsiDisp = Number.isFinite(rsiV) ? rsiV.toFixed(1) : "—";
    document.getElementById("status-text").innerHTML =
      `Last close <strong>${series.close[last].toFixed(2)}</strong> · Supertrend <strong>${st === 1 ? "bull" : "bear"}</strong> · RSI <strong>${rsiDisp}</strong> · charts updated.`;
  }

  function scoreClass(n) {
    return `cell-score s${Math.min(9, Math.max(0, Math.round(n)))}`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function matrixCell(ok) {
    const cls = ok ? "m-pass" : "m-fail";
    const bit = ok ? "1" : "0";
    return `<td class="m-cell ${cls}">${bit}</td>`;
  }

  function renderMatrixHeader() {
    const thead = document.getElementById("heatmap-head");
    if (!thead || !TT_COLS) return;
    thead.innerHTML = `
      <tr>
        <th class="sticky-col matrix-corner" scope="col">Symbol</th>
        ${TT_COLS.map(
          (c) =>
            `<th class="col-ind" scope="col" title="${escapeAttr(c.label)}">${escapeHtml(c.abbr)}</th>`
        ).join("")}
        <th class="sticky-score col-score" scope="col" title="Trend Template checks passed (of 9)">Σ</th>
      </tr>`;
  }

  async function refreshHeatmap() {
    const tbody = document.querySelector("#heatmap-body");
    const flat = [];
    for (const seg of UNIVERSE) {
      for (const stock of seg.stocks) flat.push({ seg, stock });
    }

    const batchSize = 10;
    const results = [];
    for (let i = 0; i < flat.length; i += batchSize) {
      const end = Math.min(i + batchSize, flat.length);
      tbody.innerHTML = `<tr><td colspan="${HEATMAP_COLS}" class="m-na">Scanning symbols ${end} / ${flat.length}…</td></tr>`;
      const batch = flat.slice(i, i + batchSize);
      const part = await Promise.all(
        batch.map(({ seg, stock }) =>
          DataSvc.fetchDailyChart(stock.yahooSuffix)
            .then((series) => ({ ok: true, series, stock, seg }))
            .catch(() => ({ ok: false, stock, seg }))
        )
      );
      results.push(...part);
    }

    tbody.innerHTML = "";

    for (const r of results) {
      if (!r.ok) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="sticky-col matrix-symbol">
            <span class="sym-code">${escapeHtml(r.stock.symbol)}</span>
            <span class="sym-seg">${escapeHtml(r.seg.label)}</span>
          </td>
          <td colspan="9" class="m-na">Data unavailable</td>
          <td class="sticky-score col-score cell-score s0">—</td>`;
        tbody.appendChild(tr);
        continue;
      }

      const series = r.series;
      const calc = computeAll(series);
      const last = series.close.length - 1;
      const tmpl = calc.flags[last];

      const indCells = TT_COLS.map((c) => matrixCell(Boolean(tmpl[c.key]))).join("");

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="sticky-col matrix-symbol">
          <span class="sym-code">${escapeHtml(r.stock.symbol)}</span>
          <span class="sym-seg">${escapeHtml(r.seg.label)}</span>
        </td>
        ${indCells}
        <td class="sticky-score col-score ${scoreClass(tmpl.score)}">${tmpl.score}</td>`;
      tbody.appendChild(tr);
    }
  }

  function init() {
    renderMatrixHeader();
    buildSelectOptions();
    document.getElementById("symbol-select").addEventListener("change", (e) => {
      loadSymbol(e.target.value).catch(() => {});
    });

    loadSymbol("MSFT").catch(() => {});
    refreshHeatmap().catch(() => {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
