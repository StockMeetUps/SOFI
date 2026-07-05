/**
 * Local preview: serves /app (GitHub Pages layout) and /draft (unpublished WIP).
 * Run: node preview-server.cjs
 * App:   http://127.0.0.1:8765/index.html
 *
 * /api/yahoo-chart — server-side proxy to Yahoo Finance (avoids browser CORS on the heat map).
 */
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const APP_ROOT = path.join(__dirname, "app");
const DRAFT_ROOT = path.join(__dirname, "draft");
const PORT = 8765;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

function resolvePath(urlPath) {
  const rel = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (rel.startsWith("/draft/") || rel === "/draft") {
    const sub = rel === "/draft" ? "" : rel.slice("/draft/".length);
    return { root: DRAFT_ROOT, relPath: sub };
  }
  let p = rel === "/" ? "index.html" : rel.replace(/^\//, "");
  return { root: APP_ROOT, relPath: p };
}

function proxyYahooChart(req, res) {
  let u;
  try {
    u = new URL(req.url || "/", "http://127.0.0.1");
  } catch (e) {
    res.writeHead(400);
    return res.end("Bad request");
  }
  const symbol = u.searchParams.get("symbol");
  if (!symbol) {
    res.writeHead(400);
    return res.end("Missing symbol");
  }
  const range = u.searchParams.get("range") || "5y";
  const interval = u.searchParams.get("interval") || "1d";
  const yPath = `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(
    interval
  )}&range=${encodeURIComponent(range)}`;
  const opts = {
    hostname: "query1.finance.yahoo.com",
    path: yPath,
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  };
  const yReq = https.request(opts, (yRes) => {
    const chunks = [];
    yRes.on("data", (c) => chunks.push(c));
    yRes.on("end", () => {
      const buf = Buffer.concat(chunks);
      res.writeHead(yRes.statusCode || 502, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(buf);
    });
  });
  yReq.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ chart: { error: { description: String(err.message) } } }));
  });
  yReq.setTimeout(30000, () => {
    yReq.destroy();
  });
  yReq.end();
}

const server = http.createServer((req, res) => {
  try {
    const pathOnly = decodeURIComponent((req.url || "/").split("?")[0]);
    if (pathOnly === "/api/yahoo-chart" && req.method === "GET") {
      return proxyYahooChart(req, res);
    }

    const { root, relPath } = resolvePath(req.url || "/");
    let filePath = path.normalize(path.join(root, relPath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end();
      }
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500);
    res.end();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`App: http://127.0.0.1:${PORT}/index.html`);
  console.log(`Yahoo proxy (heat map): http://127.0.0.1:${PORT}/api/yahoo-chart?symbol=MSFT`);
});
