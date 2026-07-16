/* Démarrage local : node server.js
 * Serveur HTTP minimal (sans framework) qui sert public/ en statique et
 * route /api/chat et /api/health vers les mêmes handlers que Vercel. */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleChat, handleHealth } = require("./lib/expert");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === "/api/chat") return await handleChat(req, res);
    if (url.pathname === "/api/health") return handleHealth(req, res);

    // Fichiers statiques
    const rel = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const filePath = path.join(PUBLIC_DIR, path.normalize(rel));
    if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.end("404");
      return;
    }
    res.setHeader("Content-Type", MIME[path.extname(filePath)] || "application/octet-stream");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.statusCode = 500;
    res.end("Erreur serveur");
  }
});

server.listen(PORT, () => {
  console.log(`Expert Construction IA en ligne : http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY non définie — copiez .env.example vers .env et ajoutez votre clé.");
  }
});
