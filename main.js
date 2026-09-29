const { app, BrowserWindow, screen, globalShortcut } = require("electron");
const http = require("http");
const path = require("path");
const { ipcMain } = require("electron");

let win;

function createWindow() {
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds;
  win = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });
  win.setAlwaysOnTop(true, "screen-saver");
  win.setIgnoreMouseEvents(true); // o mouse "atravessa" o overlay
  win.loadFile("index.html");
  win.webContents.openDevTools({ mode: "detach" });
}

// Servidor que recebe o GSI do Dota
const fs = require("fs");

http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const json = JSON.parse(body);
        console.log("GSI recebido. Chaves:", Object.keys(json).join(", "));
        fs.writeFileSync(
          path.join(__dirname, "gsi-last.json"),
          JSON.stringify(json, null, 2),
        );
        win?.webContents.send("gsi", json);
      } catch (e) {
        console.log("Erro GSI:", e.message);
      }
      res.end();
    });
  })
  .listen(3000, "127.0.0.1");
// http
//   .createServer((req, res) => {
//     let body = "";
//     req.on("data", (c) => (body += c));
//     req.on("end", () => {
//       try {
//         win?.webContents.send("gsi", JSON.parse(body));
//       } catch {}
//       res.end();
//     });
//   })
//   .listen(3000, "127.0.0.1");

const CACHE_DIR = path.join(app.getPath("userData"), "cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cachePath(key) {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_"); // evita path traversal
  return path.join(CACHE_DIR, `${safe}.json`);
}

ipcMain.handle("cache-get", (_, key) => {
  try {
    return JSON.parse(fs.readFileSync(cachePath(key), "utf-8")); // { timestamp, data }
  } catch {
    return null;
  }
});

ipcMain.handle("cache-set", (_, key, data) => {
  try {
    fs.writeFileSync(
      cachePath(key),
      JSON.stringify({ timestamp: Date.now(), data }),
    );
    return true;
  } catch {
    return false;
  }
});

app.whenReady().then(() => {
  createWindow();
  // F8 mostra/esconde o overlay
  globalShortcut.register("F8", () => {
    win.isVisible() ? win.hide() : win.showInactive();
  });

  let inputMode = false;
  globalShortcut.register("F10", () => {
    inputMode = !inputMode;
    win.setIgnoreMouseEvents(!inputMode);
    win.setFocusable(inputMode);
    if (inputMode) win.focus();
    win.webContents.send("input-mode", inputMode);
  });
});
