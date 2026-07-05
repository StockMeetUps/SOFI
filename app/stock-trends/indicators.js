/**
 * Technical indicators for daily OHLCV series (arrays indexed oldest→newest).
 */
(function (global) {
  "use strict";

  function sma(values, period) {
    const out = new Array(values.length).fill(NaN);
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= period) sum -= values[i - period];
      if (i >= period - 1) out[i] = sum / period;
    }
    return out;
  }

  function stdev(values, period) {
    const out = new Array(values.length).fill(NaN);
    for (let i = period - 1; i < values.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += values[j];
      const mean = sum / period;
      let v = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const d = values[j] - mean;
        v += d * d;
      }
      out[i] = Math.sqrt(v / period);
    }
    return out;
  }

  function rollingMax(arr, period) {
    const out = new Array(arr.length).fill(NaN);
    for (let i = period - 1; i < arr.length; i++) {
      let m = -Infinity;
      for (let j = i - period + 1; j <= i; j++) m = Math.max(m, arr[j]);
      out[i] = m;
    }
    return out;
  }

  function rollingMin(arr, period) {
    const out = new Array(arr.length).fill(NaN);
    for (let i = period - 1; i < arr.length; i++) {
      let m = Infinity;
      for (let j = i - period + 1; j <= i; j++) m = Math.min(m, arr[j]);
      out[i] = m;
    }
    return out;
  }

  /** Wilder's ATR */
  function atr(high, low, close, period) {
    const n = close.length;
    const tr = new Array(n).fill(NaN);
    for (let i = 1; i < n; i++) {
      const hl = high[i] - low[i];
      const hc = Math.abs(high[i] - close[i - 1]);
      const lc = Math.abs(low[i] - close[i - 1]);
      tr[i] = Math.max(hl, hc, lc);
    }
    const out = new Array(n).fill(NaN);
    let prevAtr = NaN;
    for (let i = 1; i < n; i++) {
      if (i < period) continue;
      if (!Number.isFinite(prevAtr)) {
        let s = 0;
        for (let j = i - period + 1; j <= i; j++) s += tr[j];
        prevAtr = s / period;
        out[i] = prevAtr;
      } else {
        prevAtr = (prevAtr * (period - 1) + tr[i]) / period;
        out[i] = prevAtr;
      }
    }
    return out;
  }

  function bollinger(close, length, mult) {
    const basis = sma(close, length);
    const sd = stdev(close, length);
    const upper = basis.map((b, i) => (Number.isFinite(b) ? b + mult * (sd[i] || 0) : NaN));
    const lower = basis.map((b, i) => (Number.isFinite(b) ? b - mult * (sd[i] || 0) : NaN));
    return { basis, upper, lower };
  }

  /**
   * Supertrend (TradingView-style): period ATR, multiplier, source hl2.
   * Returns line values and trend: 1 = bullish (green below price), -1 = bearish.
   */
  function supertrend(high, low, close, period, multiplier) {
    const n = close.length;
    const atrLine = atr(high, low, close, period);
    const hl2 = high.map((h, i) => (h + low[i]) / 2);
    const upperBand = hl2.map((v, i) => v + multiplier * (atrLine[i] || NaN));
    const lowerBand = hl2.map((v, i) => v - multiplier * (atrLine[i] || NaN));

    const finalUpper = new Array(n).fill(NaN);
    const finalLower = new Array(n).fill(NaN);
    const trend = new Array(n).fill(NaN);
    const line = new Array(n).fill(NaN);

    for (let i = period; i < n; i++) {
      const ub = upperBand[i];
      const lb = lowerBand[i];
      const prevClose = close[i - 1];
      const pFU = finalUpper[i - 1];
      const pFL = finalLower[i - 1];

      if (!Number.isFinite(ub) || !Number.isFinite(lb)) continue;

      let fu = ub;
      if (Number.isFinite(pFU) && (ub < pFU || prevClose > pFU)) fu = pFU;

      let fl = lb;
      if (Number.isFinite(pFL) && (lb > pFL || prevClose < pFL)) fl = pFL;

      finalUpper[i] = fu;
      finalLower[i] = fl;

      let t = trend[i - 1];
      if (!Number.isFinite(t)) t = 1;

      const prevBarUp = finalUpper[i - 1];
      const prevBarLo = finalLower[i - 1];
      if (Number.isFinite(prevBarUp) && close[i] > prevBarUp) t = 1;
      else if (Number.isFinite(prevBarLo) && close[i] < prevBarLo) t = -1;

      trend[i] = t;
      line[i] = t === 1 ? fl : fu;
    }

    return { line, trend, finalUpper, finalLower };
  }

  /** RSI (Wilder / RSI classic 14) */
  function rsi(close, period) {
    const n = close.length;
    const out = new Array(n).fill(NaN);
    if (n < period + 1) return out;

    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 1; i <= period; i++) {
      const ch = close[i] - close[i - 1];
      avgGain += ch > 0 ? ch : 0;
      avgLoss += ch < 0 ? -ch : 0;
    }
    avgGain /= period;
    avgLoss /= period;
    const rs0 = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    out[period] = 100 - 100 / (1 + rs0);

    for (let i = period + 1; i < n; i++) {
      const ch = close[i] - close[i - 1];
      const g = ch > 0 ? ch : 0;
      const l = ch < 0 ? -ch : 0;
      avgGain = (avgGain * (period - 1) + g) / period;
      avgLoss = (avgLoss * (period - 1) + l) / period;
      const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
      out[i] = 100 - 100 / (1 + rs);
    }
    return out;
  }

  /** +DI, -DI, ADX (Wilder smoothing on TR and DM) */
  function dmiAdx(high, low, close, period) {
    const n = close.length;
    const tr = new Array(n).fill(NaN);
    const plusDM = new Array(n).fill(NaN);
    const minusDM = new Array(n).fill(NaN);

    for (let i = 1; i < n; i++) {
      const upMove = high[i] - high[i - 1];
      const downMove = low[i - 1] - low[i];
      const hl = high[i] - low[i];
      const hc = Math.abs(high[i] - close[i - 1]);
      const lc = Math.abs(low[i] - close[i - 1]);
      tr[i] = Math.max(hl, hc, lc);
      plusDM[i] = upMove > downMove && upMove > 0 ? upMove : 0;
      minusDM[i] = downMove > upMove && downMove > 0 ? downMove : 0;
    }

    const smTR = new Array(n).fill(NaN);
    const smPlus = new Array(n).fill(NaN);
    const smMinus = new Array(n).fill(NaN);

    let sumTR = 0;
    let sumP = 0;
    let sumM = 0;
    for (let i = 1; i < n; i++) {
      sumTR += tr[i];
      sumP += plusDM[i];
      sumM += minusDM[i];
      if (i === period) {
        smTR[i] = sumTR;
        smPlus[i] = sumP;
        smMinus[i] = sumM;
      } else if (i > period) {
        smTR[i] = smTR[i - 1] - smTR[i - 1] / period + tr[i];
        smPlus[i] = smPlus[i - 1] - smPlus[i - 1] / period + plusDM[i];
        smMinus[i] = smMinus[i - 1] - smMinus[i - 1] / period + minusDM[i];
      }
    }

    const plusDIS = new Array(n).fill(NaN);
    const minusDIS = new Array(n).fill(NaN);
    for (let i = period; i < n; i++) {
      if (!Number.isFinite(smTR[i]) || smTR[i] === 0) continue;
      plusDIS[i] = (100 * smPlus[i]) / smTR[i];
      minusDIS[i] = (100 * smMinus[i]) / smTR[i];
    }

    const dx = new Array(n).fill(NaN);
    for (let i = period; i < n; i++) {
      const p = plusDIS[i];
      const m = minusDIS[i];
      if (!Number.isFinite(p) || !Number.isFinite(m)) continue;
      const den = p + m;
      dx[i] = den === 0 ? 0 : (Math.abs(p - m) / den) * 100;
    }

    const adx = new Array(n).fill(NaN);
    const firstAdxIdx = 2 * period - 1;
    if (firstAdxIdx < n) {
      let s = 0;
      for (let j = period; j <= 2 * period - 1 && j < n; j++) s += dx[j] || 0;
      adx[firstAdxIdx] = s / period;
      for (let i = firstAdxIdx + 1; i < n; i++) {
        adx[i] = (adx[i - 1] * (period - 1) + (dx[i] || 0)) / period;
      }
    }

    return { plusDI: plusDIS, minusDI: minusDIS, adx };
  }

  /**
   * Squeeze momentum (LazyBear-style simplified): lengthBB 20, mult 2, lengthKC 20, multKC 1.5.
   * squeeze[i] true when Bollinger bandwidth inside Keltner.
   */
  function squeezeMomentum(high, low, close, bbLen, bbMult, kcLen, kcMult) {
    const n = close.length;
    const basis = sma(close, bbLen);
    const sd = stdev(close, bbLen);
    const bbU = basis.map((b, i) => (Number.isFinite(b) ? b + bbMult * sd[i] : NaN));
    const bbL = basis.map((b, i) => (Number.isFinite(b) ? b - bbMult * sd[i] : NaN));
    const atrKC = atr(high, low, close, kcLen);
    const maKC = sma(close, kcLen);
    const kcU = maKC.map((m, i) => (Number.isFinite(m) ? m + kcMult * (atrKC[i] || NaN) : NaN));
    const kcL = maKC.map((m, i) => (Number.isFinite(m) ? m - kcMult * (atrKC[i] || NaN) : NaN));

    const squeezeOn = new Array(n).fill(false);
    for (let i = 0; i < n; i++) {
      if (
        Number.isFinite(bbU[i]) &&
        Number.isFinite(bbL[i]) &&
        Number.isFinite(kcU[i]) &&
        Number.isFinite(kcL[i])
      ) {
        squeezeOn[i] = bbU[i] < kcU[i] && bbL[i] > kcL[i];
      }
    }

    const highest = rollingMax(high, kcLen);
    const lowest = rollingMin(low, kcLen);
    const mid = highest.map((h, i) => (Number.isFinite(h) && Number.isFinite(lowest[i]) ? (h + lowest[i]) / 2 : NaN));
    const momentum = close.map((c, i) => (Number.isFinite(mid[i]) ? c - mid[i] : NaN));

    return { squeezeOn, momentum, bbUpper: bbU, bbLower: bbL, kcUpper: kcU, kcLower: kcL };
  }

  global.TechIndicators = {
    sma,
    stdev,
    rollingMax,
    rollingMin,
    atr,
    bollinger,
    supertrend,
    rsi,
    dmiAdx,
    squeezeMomentum,
  };
})(typeof window !== "undefined" ? window : globalThis);
