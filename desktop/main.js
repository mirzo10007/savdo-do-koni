// Savdo do'koni — Windows dasturi (Electron asosiy jarayoni)
const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

if (!app.requestSingleInstanceLock()) { app.quit(); }

const DATA_DIR = path.join(app.getPath('userData'), 'data');
const DATA_FILE = path.join(DATA_DIR, 'savdo-dokoni-data.json');
const DEFAULT_BACKUP = path.join(app.getPath('documents'), "Savdo do'koni zaxira");

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }
function writeAtomic(file, text) {
  ensureDir(path.dirname(file));
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, text, 'utf8');
  fs.renameSync(tmp, file);
}

let win = null;

function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1366, height: 820, minWidth: 1000, minHeight: 640,
    show: false, title: "Savdo do'koni", backgroundColor: '#ffffff', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      devTools: false, spellcheck: false
    }
  });
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.on('before-input-event', (e, input) => {
    const k = (input.key || '').toUpperCase();
    if (input.control && input.shift && (k === 'I' || k === 'J' || k === 'C')) e.preventDefault();
  });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

// ---- ma'lumotlar ----
ipcMain.handle('gmz:load', () => { try { return fs.readFileSync(DATA_FILE, 'utf8'); } catch (e) { return null; } });
ipcMain.handle('gmz:save', (e, text) => { writeAtomic(DATA_FILE, text); return true; });
ipcMain.on('gmz:saveSync', (e, text) => { try { writeAtomic(DATA_FILE, text); e.returnValue = true; } catch (err) { e.returnValue = false; } });
ipcMain.handle('gmz:dataPath', () => DATA_FILE);
ipcMain.handle('gmz:openPath', (e, p) => shell.openPath(p || DATA_DIR));

// ---- zaxira ----
ipcMain.handle('gmz:backupDir', (e, p) => (p && fs.existsSync(p)) ? p : DEFAULT_BACKUP);
ipcMain.handle('gmz:chooseDir', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Zaxira papkasini tanlang', properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('gmz:backup', (e, text, day, dir) => {
  dir = (dir && fs.existsSync(path.dirname(dir))) ? dir : DEFAULT_BACKUP;
  ensureDir(dir);
  writeAtomic(path.join(dir, 'savdo-dokoni-' + day + '.json'), text);
  const files = fs.readdirSync(dir).filter(n => /^savdo-dokoni-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
  const extra = files.slice(0, Math.max(0, files.length - 30));
  for (const n of extra) { try { fs.unlinkSync(path.join(dir, n)); } catch (_) {} }
  return { count: files.length - extra.length, dir };
});

// ---- chop etish (oynasiz) ----
ipcMain.handle('gmz:printers', async () => {
  const list = await win.webContents.getPrintersAsync();
  return list.map(p => ({ name: p.name, isDefault: !!p.isDefault }));
});
ipcMain.handle('gmz:print', async (e, html, opt) => {
  opt = opt || {};
  const pw = new BrowserWindow({ show: false, webPreferences: { sandbox: true, devTools: false } });
  try {
    await pw.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    if (opt.a4) {
      // A4 ro'yxatlar: Windows chop etish oynasi ochiladi, printerni foydalanuvchi tanlaydi
      return await new Promise((resolve) => {
        pw.webContents.print({ silent: false, printBackground: false, pageSize: 'A4' },
          (ok, err) => { resolve({ ok, err: err || '' }); setTimeout(() => { if (!pw.isDestroyed()) pw.destroy(); }, 800); });
      });
    }
    let hPx = 600;
    try { hPx = await pw.webContents.executeJavaScript('document.documentElement.scrollHeight'); } catch (_) {}
    const widthMicrons = Math.round((opt.widthMm || 80) * 1000);
    const heightMicrons = Math.max(50000, Math.round(hPx * 264.6) + 10000);
    return await new Promise((resolve) => {
      pw.webContents.print({
        silent: true, printBackground: false, deviceName: opt.printer || '',
        margins: { marginType: 'none' }, pageSize: { width: widthMicrons, height: heightMicrons }
      }, (ok, err) => { resolve({ ok, err: err || '' }); setTimeout(() => { if (!pw.isDestroyed()) pw.destroy(); }, 800); });
    });
  } catch (err) {
    if (!pw.isDestroyed()) pw.destroy();
    return { ok: false, err: String(err && err.message || err) };
  }
});

// ---- litsenziya uchun kompyuter identifikatori ----
ipcMain.handle('gmz:machineId', () => {
  let guid = '';
  try {
    const out = execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid /reg:64', { encoding: 'utf8', windowsHide: true });
    const m = out.match(/MachineGuid\s+REG_SZ\s+([0-9a-fA-F-]+)/);
    if (m) guid = m[1].toLowerCase();
  } catch (_) {}
  if (!guid) { const c = os.cpus(); guid = os.hostname() + '|' + (c && c[0] ? c[0].model : '') + '|' + os.totalmem(); }
  return guid;
});
