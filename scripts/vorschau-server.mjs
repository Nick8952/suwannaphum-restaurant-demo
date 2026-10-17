// Lokaler Testserver, der den statischen Export so ausliefert wie GitHub Pages:
// unter dem Repository-Unterpfad, mit index.html bei Ordnern, Umleitung auf den Schluss-Schrägstrich und 404.html bei Fehlern.
// Aufruf: npm run vorschau:pages  → http://localhost:4321/suwannaphum-restaurant-demo/
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const wurzel = path.resolve(import.meta.dirname, "..", "out");
const basePath = process.env.BASE_PATH ?? "/suwannaphum-restaurant-demo";
const port = Number(process.env.PORT ?? 4321);
const typen = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".avif": "image/avif", ".png": "image/png", ".jpg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain", ".xml": "application/xml", ".ico": "image/x-icon", ".pdf": "application/pdf" };

const host = process.env.HOST ?? "127.0.0.1"; // nur lokal erreichbar (Codex-Befund)

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end("Ungültige Adresse."); }
  if (!p.startsWith(basePath + "/") && p !== basePath) {
    res.writeHead(404, { "content-type": "text/plain" });
    return res.end("Ausserhalb des Unterpfads (wie auf GitHub Pages).");
  }
  p = p.slice(basePath.length) || "/";
  // Nie ausserhalb von out/ lesen (auch nicht über kodierte «..»).
  let datei = path.resolve(wurzel, "." + p);
  if (datei !== wurzel && !datei.startsWith(wurzel + path.sep)) { res.writeHead(403); return res.end("Verboten."); }
  try {
    if ((await stat(datei)).isDirectory()) {
      // Wie GitHub Pages (301) und Vercel (308): Ordner ohne Schluss-Schrägstrich werden auf die Adresse mit Schrägstrich umgeleitet.
      if (!url.pathname.endsWith("/")) { res.writeHead(301, { location: url.pathname + "/" + url.search }); return res.end(); }
      datei = path.join(datei, "index.html");
    }
  } catch {
    if (!path.extname(datei)) datei = datei + ".html";
  }
  try {
    const inhalt = await readFile(datei);
    res.writeHead(200, { "content-type": typen[path.extname(datei)] ?? "application/octet-stream" });
    res.end(inhalt);
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    try {
      res.end(await readFile(path.join(wurzel, "404.html")));
    } catch {
      res.end("<!doctype html><meta charset=\"utf-8\"><title>404</title><p>Nicht gefunden. out/404.html fehlt: zuerst «npm run build» ausführen.</p>");
    }
  }
});
server.on("error", (fehler) => {
  console.error(`Vorschau-Server konnte nicht starten (${host}:${port}): ${fehler.message}`);
  process.exit(1);
});
server.listen(port, host, () => console.log(`Vorschau: http://localhost:${port}${basePath}/`));
