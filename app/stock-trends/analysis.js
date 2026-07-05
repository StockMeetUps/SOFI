/**
 * Minervini-style Trend Template, optional RSI signal line, buy/sell markers.
 */
(function (global) {
  "use strict";

  const TI = global.TechIndicators;

  const WEEK52 = 252;
  const MONTH_TRADING = 21;

  function trendTemplateFlags(series) {
    const { close, high, low } = series;
    const n = close.length;
    const sma50 = TI.sma(close, 50);
    const sma150 = TI.sma(close, 150);
    const sma200 = TI.sma(close, 200);
    const low52 = TI.rollingMin(low, WEEK52);
    const high52 = TI.rollingMax(high, WEEK52);

    const flags = [];
    for (let i = 0; i < n; i++) {
      const c = close[i];
      const s50 = sma50[i];
      const s150 = sma150[i];
      const s200 = sma200[i];
      const s200Lag = i >= MONTH_TRADING ? sma200[i - MONTH_TRADING] : NaN;
      const lo = low52[i];
      const hi = high52[i];

      const f = {
        priceAbove150: Number.isFinite(c) && Number.isFinite(s150) && c > s150,
        priceAbove200: Number.isFinite(c) && Number.isFinite(s200) && c > s200,
        ma150Above200: Number.isFinite(s150) && Number.isFinite(s200) && s150 > s200,
        ma200RisingMonth:
          Number.isFinite(s200) && Number.isFinite(s200Lag) && s200 > s200Lag,
        ma50Above150: Number.isFinite(s50) && Number.isFinite(s150) && s50 > s150,
        ma50Above200: Number.isFinite(s50) && Number.isFinite(s200) && s50 > s200,
        priceAbove50: Number.isFinite(c) && Number.isFinite(s50) && c > s50,
        above25PctFromLow:
          Number.isFinite(c) && Number.isFinite(lo) && lo > 0 && c >= 1.25 * lo,
        within25PctOfHigh:
          Number.isFinite(c) && Number.isFinite(hi) && hi > 0 && c >= 0.75 * hi,
      };

      const score = Object.values(f).filter(Boolean).length;
      flags.push({ ...f, score, sma50: s50, sma150: s150, sma200: s200 });
    }
    return { flags, sma50, sma150, sma200 };
  }

  function rsiWithSignal(close, len, signalLen) {
    const rsi = TI.rsi(close, len);
    const signal = new Array(rsi.length).fill(NaN);
    for (let i = len + signalLen - 1; i < rsi.length; i++) {
      let sum = 0;
      for (let k = 0; k < signalLen; k++) sum += rsi[i - k];
      signal[i] = sum / signalLen;
    }
    return { rsi, signal };
  }

  /**
   * Buy: Supertrend flips to +1 from -1, or strong combo: bull ST + touch lower BB (within 0.5% of lower).
   * Sell: Supertrend flips to -1 from +1.
   */
  function computeSignals(series, bb, st) {
    const { close, low, high } = series;
    const { lower } = bb;
    const { trend } = st;
    const n = close.length;
    const markers = [];
    for (let i = 1; i < n; i++) {
      const prev = trend[i - 1];
      const cur = trend[i];
      if (!Number.isFinite(prev) || !Number.isFinite(cur)) continue;

      if (prev === -1 && cur === 1) {
        markers.push({ index: i, type: "buy", reason: "Supertrend turned bullish" });
        continue;
      }
      if (prev === 1 && cur === -1) {
        markers.push({ index: i, type: "sell", reason: "Supertrend turned bearish" });
        continue;
      }

      const loBand = lower[i];
      if (
        cur === 1 &&
        Number.isFinite(loBand) &&
        low[i] <= loBand * 1.005 &&
        low[i] >= loBand * 0.995
      ) {
        const last = markers[markers.length - 1];
        if (!last || last.index !== i || last.type !== "buy") {
          markers.push({
            index: i,
            type: "buy",
            reason: "Uptrend: price tested lower Bollinger Band (dip)",
          });
        }
      }
    }
    return markers;
  }

  function buildNarrativeBuy(lastBar, template, stTrend, rsiVal, adxVal, squeezeOn) {
    const parts = [];
    if (template.score >= 7) parts.push(`Trend Template strong (${template.score}/9)`);
    else if (template.score >= 4) parts.push(`Trend Template mixed (${template.score}/9)`);
    else parts.push(`Trend Template weak (${template.score}/9)`);

    if (stTrend === 1) parts.push("Supertrend bullish");
    else parts.push("Supertrend bearish — wait for trend flip or use smaller size");

    if (Number.isFinite(rsiVal)) {
      if (rsiVal < 35) parts.push("RSI oversold — potential bounce if trend intact");
      else if (rsiVal > 70) parts.push("RSI stretched — avoid chasing; prefer pullback entries");
    }

    if (Number.isFinite(adxVal) && adxVal > 25) parts.push("ADX shows a trending regime");
    else parts.push("ADX moderate/choppy — mean-reversion risk");

    if (squeezeOn) parts.push("Volatility squeeze ON — watch for expansion breakout");
    else parts.push("Squeeze released — momentum phase may be underway");

    return parts.join(" · ");
  }

  function buildNarrativeSell(lastBar, template, stTrend, rsiVal) {
    const parts = [];
    if (template.score < 4) parts.push("Few Trend Template checks — trend leadership fading");
    if (stTrend === -1) parts.push("Supertrend bearish — primary trend down");
    if (Number.isFinite(rsiVal) && rsiVal > 70) parts.push("RSI overbought — take-profits / tighten stops");
    if (Number.isFinite(rsiVal) && rsiVal < 35) parts.push("RSI oversold — bounce risk; scale out vs. panic");
    return parts.join(" · ") || "Review Supertrend / MAs for exit or trim.";
  }

  /** Column order for matrix heatmap (9 Trend Template checks). */
  const TREND_TEMPLATE_COLUMNS = [
    { key: "priceAbove150", abbr: "P>150", label: "Price > 150-day MA" },
    { key: "priceAbove200", abbr: "P>200", label: "Price > 200-day MA" },
    { key: "ma150Above200", abbr: "150>200", label: "150-day MA > 200-day MA" },
    { key: "ma200RisingMonth", abbr: "200↑", label: "200-day MA rising (~1 month)" },
    { key: "ma50Above150", abbr: "50>150", label: "50-day MA > 150-day MA" },
    { key: "ma50Above200", abbr: "50>200", label: "50-day MA > 200-day MA" },
    { key: "priceAbove50", abbr: "P>50", label: "Price above 50-day MA" },
    { key: "above25PctFromLow", abbr: "+25%Lo", label: "Price ≥ 25% above 52-week low" },
    { key: "within25PctOfHigh", abbr: "Hi25%", label: "Within 25% of 52-week high" },
  ];

  global.StockAnalysis = {
    trendTemplateFlags,
    rsiWithSignal,
    computeSignals,
    buildNarrativeBuy,
    buildNarrativeSell,
    WEEK52,
    TREND_TEMPLATE_COLUMNS,
  };
})(typeof window !== "undefined" ? window : globalThis);
