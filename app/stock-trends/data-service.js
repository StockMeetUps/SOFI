/**
 * Fetch daily OHLCV from Yahoo Finance chart API.
 * - Prefer same-origin /api/yahoo-chart when served by preview-server.cjs (no CORS).
 * - Else direct Yahoo (often blocked by CORS in browsers), then public proxies.
 */
(function (global) {
  "use strict";

  const RANGE = "5y";
  const INTERVAL = "1d";

  function yahooUrl(symbol) {
    const s = encodeURIComponent(symbol);
    return `https://query1.finance.yahoo.com/v8/finance/chart/${s}?interval=${INTERVAL}&range=${RANGE}`;
  }

  function parseYahooChart(json) {
    const err = json.chart && json.chart.error;
    if (err) throw new Error(err.description || "Yahoo chart error");

    const r = json.chart && json.chart.result && json.chart.result[0];
    if (!r) throw new Error("Invalid Yahoo chart response");

    const quote = r.indicators && r.indicators.quote && r.indicators.quote[0];
    const ts = r.timestamp || [];
    if (!quote || !ts.length) throw new Error("No quote data");

    const open = quote.open || [];
    const high = quote.high || [];
    const low = quote.low || [];
    const close = quote.close || [];
    const volume = quote.volume || [];

    const dates = [];
    const O = [];
    const H = [];
    const L = [];
    const C = [];
    const V = [];

    for (let i = 0; i < ts.length; i++) {
      const c = close[i];
      if (c == null || !Number.isFinite(c)) continue;
      dates.push(new Date(ts[i] * 1000));
      O.push(open[i] != null ? open[i] : c);
      H.push(high[i] != null ? high[i] : c);
      L.push(low[i] != null ? low[i] : c);
      C.push(c);
      V.push(volume[i] != null ? volume[i] : 0);
    }

    return { dates, open: O, high: H, low: L, close: C, volume: V };
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function fetchViaRelay(url) {
    const relay = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(relay, { cache: "no-store" });
    if (!res.ok) throw new Error(`Relay HTTP ${res.status}`);
    const wrap = await res.json();
    if (!wrap.contents) throw new Error("Empty relay body");
    return JSON.parse(wrap.contents);
  }

  async function fetchViaCodetabs(url) {
    const relay = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
    const res = await fetch(relay, { cache: "no-store" });
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    return res.json();
  }

  /** Same-origin proxy added in preview-server.cjs */
  async function fetchViaLocalProxy(symbol) {
    if (typeof window === "undefined" || !window.location) return null;
    const { protocol, origin } = window.location;
    if (protocol !== "http:" && protocol !== "https:") return null;

    const proxy = `${origin}/api/yahoo-chart?symbol=${encodeURIComponent(
      symbol
    )}&interval=${INTERVAL}&range=${RANGE}`;
    const res = await fetch(proxy, { cache: "no-store" });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("application/json")) return null;
    return res.json();
  }

  async function fetchDailyChart(symbol) {
    const url = yahooUrl(symbol);
    const tried = [];

    const local = await fetchViaLocalProxy(symbol).catch((e) => {
      tried.push(`local:${e.message}`);
      return null;
    });
    if (local) {
      try {
        return parseYahooChart(local);
      } catch (e) {
        tried.push(`parse(local):${e.message}`);
      }
    }

    const chain = [
      () => fetchJson(url),
      () => fetchViaRelay(url),
      () => fetchViaCodetabs(url),
    ];

    let lastErr = new Error("All fetch methods failed");
    for (const fn of chain) {
      try {
        const json = await fn();
        return parseYahooChart(json);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }

  global.StockDataService = {
    fetchDailyChart,
    yahooUrl,
  };
})(typeof window !== "undefined" ? window : globalThis);
