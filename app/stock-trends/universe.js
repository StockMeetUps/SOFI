/**
 * Five thematic segments × ten liquid US equities each (50 symbols for heat map).
 */
(function (global) {
  "use strict";

  const SEGMENTS = [
    {
      id: "mega-tech",
      label: "Mega-cap Technology",
      thesis:
        "Large platforms with durable cash flows; Trend Template scores highlight institutional-quality uptrends.",
      stocks: [
        { symbol: "MSFT", name: "Microsoft", yahooSuffix: "MSFT" },
        { symbol: "AAPL", name: "Apple", yahooSuffix: "AAPL" },
        { symbol: "GOOGL", name: "Alphabet (Class A)", yahooSuffix: "GOOGL" },
        { symbol: "META", name: "Meta Platforms", yahooSuffix: "META" },
        { symbol: "NFLX", name: "Netflix", yahooSuffix: "NFLX" },
        { symbol: "CRM", name: "Salesforce", yahooSuffix: "CRM" },
        { symbol: "ORCL", name: "Oracle", yahooSuffix: "ORCL" },
        { symbol: "ADBE", name: "Adobe", yahooSuffix: "ADBE" },
        { symbol: "INTU", name: "Intuit", yahooSuffix: "INTU" },
        { symbol: "NOW", name: "ServiceNow", yahooSuffix: "NOW" },
      ],
    },
    {
      id: "semis",
      label: "Semiconductors",
      thesis:
        "Cyclical growth tied to AI/datacenter Capex; signals emphasize momentum and volatility regimes (squeeze).",
      stocks: [
        { symbol: "NVDA", name: "NVIDIA", yahooSuffix: "NVDA" },
        { symbol: "AMD", name: "AMD", yahooSuffix: "AMD" },
        { symbol: "INTC", name: "Intel", yahooSuffix: "INTC" },
        { symbol: "AVGO", name: "Broadcom", yahooSuffix: "AVGO" },
        { symbol: "QCOM", name: "Qualcomm", yahooSuffix: "QCOM" },
        { symbol: "MU", name: "Micron", yahooSuffix: "MU" },
        { symbol: "AMAT", name: "Applied Materials", yahooSuffix: "AMAT" },
        { symbol: "LRCX", name: "Lam Research", yahooSuffix: "LRCX" },
        { symbol: "KLAC", name: "KLA", yahooSuffix: "KLAC" },
        { symbol: "TXN", name: "Texas Instruments", yahooSuffix: "TXN" },
      ],
    },
    {
      id: "healthcare",
      label: "Healthcare Leaders",
      thesis:
        "Defensive growth and pharma/devices; useful when comparing relative strength vs. broad tech.",
      stocks: [
        { symbol: "UNH", name: "UnitedHealth", yahooSuffix: "UNH" },
        { symbol: "JNJ", name: "Johnson & Johnson", yahooSuffix: "JNJ" },
        { symbol: "LLY", name: "Eli Lilly", yahooSuffix: "LLY" },
        { symbol: "MRK", name: "Merck", yahooSuffix: "MRK" },
        { symbol: "PFE", name: "Pfizer", yahooSuffix: "PFE" },
        { symbol: "ABBV", name: "AbbVie", yahooSuffix: "ABBV" },
        { symbol: "TMO", name: "Thermo Fisher", yahooSuffix: "TMO" },
        { symbol: "ABT", name: "Abbott", yahooSuffix: "ABT" },
        { symbol: "DHR", name: "Danaher", yahooSuffix: "DHR" },
        { symbol: "ISRG", name: "Intuitive Surgical", yahooSuffix: "ISRG" },
      ],
    },
    {
      id: "financials",
      label: "Financials",
      thesis:
        "Rate-sensitive banks and diversified finance; Trend Template filters sustained trends vs. chop.",
      stocks: [
        { symbol: "JPM", name: "JPMorgan", yahooSuffix: "JPM" },
        { symbol: "GS", name: "Goldman Sachs", yahooSuffix: "GS" },
        { symbol: "BAC", name: "Bank of America", yahooSuffix: "BAC" },
        { symbol: "MS", name: "Morgan Stanley", yahooSuffix: "MS" },
        { symbol: "C", name: "Citigroup", yahooSuffix: "C" },
        { symbol: "WFC", name: "Wells Fargo", yahooSuffix: "WFC" },
        { symbol: "SCHW", name: "Charles Schwab", yahooSuffix: "SCHW" },
        { symbol: "BLK", name: "BlackRock", yahooSuffix: "BLK" },
        { symbol: "BX", name: "Blackstone", yahooSuffix: "BX" },
        { symbol: "SPGI", name: "S&P Global", yahooSuffix: "SPGI" },
      ],
    },
    {
      id: "consumer",
      label: "Consumer / Retail",
      thesis:
        "Household demand and membership models; pair with sector thesis from the heat map narrative.",
      stocks: [
        { symbol: "AMZN", name: "Amazon", yahooSuffix: "AMZN" },
        { symbol: "COST", name: "Costco", yahooSuffix: "COST" },
        { symbol: "WMT", name: "Walmart", yahooSuffix: "WMT" },
        { symbol: "TGT", name: "Target", yahooSuffix: "TGT" },
        { symbol: "HD", name: "Home Depot", yahooSuffix: "HD" },
        { symbol: "LOW", name: "Lowe's", yahooSuffix: "LOW" },
        { symbol: "NKE", name: "Nike", yahooSuffix: "NKE" },
        { symbol: "SBUX", name: "Starbucks", yahooSuffix: "SBUX" },
        { symbol: "MCD", name: "McDonald's", yahooSuffix: "MCD" },
        { symbol: "TJX", name: "TJX Companies", yahooSuffix: "TJX" },
      ],
    },
  ];

  global.STOCK_UNIVERSE = { SEGMENTS };
})(typeof window !== "undefined" ? window : globalThis);
