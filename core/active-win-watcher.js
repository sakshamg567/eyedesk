// activewin-watcher-improved.js
// Detect focused app via active-win + heuristics, POST appSwitch JSON to server
//
// Usage: node activewin-watcher.js
// Env:
//   SERVER_HOST (default localhost)
//   SERVER_PORT (default 3000)
//   SERVER_PATH (default /app-switch)
//   POLL_MS (default 700)
//   DEBOUNCE_MS (default 600)

const activeWin = require('active-win');
const { execSync } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

const POLL_MS = Number(process.env.POLL_MS || 5000);
const DEBOUNCE_MS = Number(process.env.DEBOUNCE_MS || 600);
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const SERVER_PORT = Number(process.env.SERVER_PORT || 3000);
const SERVER_PATH = process.env.SERVER_PATH || '/app-switch';

let lastSeen = { app: null, title: null, at: 0 };
let lastSentAt = 0;

// POST JSON helper
function postJson(bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const opts = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: SERVER_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 5000
    };
    const req = http.request(opts, (res) => {
      const bufs = [];
      res.on('data', (c) => bufs.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(bufs).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(raw);
        return reject(new Error(`status ${res.statusCode}: ${raw}`));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.write(body);
    req.end();
  });
}

// helper: try xprop for Xwayland windows (best-effort)
function tryXpropWmClass(windowId) {
  try {
    if (!windowId) return null;
    const idNum = Number(windowId);
    if (!isFinite(idNum) || idNum <= 0) return null;
    const winHex = '0x' + idNum.toString(16);
    const out = execSync(`xprop -id ${winHex} WM_CLASS`, { encoding: 'utf8', timeout: 1000 }).trim();
    const m = out.match(/WM_CLASS\([^)]+\)\s*=\s*(.+)/);
    if (!m) return null;
    const entries = m[1].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    return entries[entries.length - 1] || entries[0] || null;
  } catch {
    return null;
  }
}

function titleCase(s) {
  if (!s) return s;
  return String(s).replace(/[-_.]+/g, ' ').split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').trim();
}

// simple normalization heuristics (same as before, improved)
function normalizeAppHeuristic(rawOwnerName, ownerPath, title, windowId) {
  if (rawOwnerName) {
    const rn = String(rawOwnerName).trim();
    const key = rn.toLowerCase();
    const map = {
      'gnome-terminal-server': 'Terminal',
      'gnome-terminal': 'Terminal',
      'tilix': 'Terminal',
      'konsole': 'Terminal',
      'xfce4-terminal': 'Terminal',
      'code': 'VS Code',
      'visual studio code': 'VS Code',
      'brave-browser': 'Brave',
      'brave': 'Brave',
      'google-chrome': 'Chrome',
      'chromium': 'Chromium',
      'firefox': 'Firefox',
      'gnome-control-center': 'Settings',
      'org.gnome.gnome-control-center': 'Settings',
      'nautilus': 'Files',
      'nemo': 'Files',
      'org.gnome.Nautilus': 'Files',
      'alacritty': 'Terminal',
      'kitty': 'Terminal',
      'xterm': 'Terminal'
    };
    if (map[key]) return { app: map[key], reason: 'owner-map' };
    if (key.length > 1) return { app: titleCase(key.replace(/[-_\.]/g, ' ')), reason: 'owner-titlecase' };
  }

  if (ownerPath) {
    const bn = path.basename(String(ownerPath || ''));
    const k = bn.toLowerCase();
    if (k) {
      if (k.includes('gnome-control-center') || k.includes('control-center')) return { app: 'Settings', reason: 'ownerpath' };
      if (/gnome-terminal|tilix|konsole|alacritty|kitty|xterm/.test(k)) return { app: 'Terminal', reason: 'ownerpath' };
      if (k.includes('code')) return { app: 'VS Code', reason: 'ownerpath' };
      if (k.includes('brave')) return { app: 'Brave', reason: 'ownerpath' };
      if (k.includes('chrome')) return { app: 'Chrome', reason: 'ownerpath' };
      if (k.includes('firefox')) return { app: 'Firefox', reason: 'ownerpath' };
      if (k.includes('nautilus') || k.includes('nemo')) return { app: 'Files', reason: 'ownerpath' };
      return { app: titleCase(k.replace(/[-_\.]/g, ' ')), reason: 'ownerpath-fallback' };
    }
  }

  const wmclass = tryXpropWmClass(windowId);
  if (wmclass) {
    const key = String(wmclass).toLowerCase();
    if (key.includes('gnome-control-center')) return { app: 'Settings', reason: 'xprop-wmclass' };
    if (/terminal|konsole|alacritty|kitty/.test(key)) return { app: 'Terminal', reason: 'xprop-wmclass' };
    if (key.includes('code')) return { app: 'VS Code', reason: 'xprop-wmclass' };
    if (key.includes('brave')) return { app: 'Brave', reason: 'xprop-wmclass' };
    if (key.includes('chrome')) return { app: 'Chrome', reason: 'xprop-wmclass' };
    if (key.includes('firefox')) return { app: 'Firefox', reason: 'xprop-wmclass' };
    return { app: titleCase(key.replace(/[-_\.]/g,' ')), reason: 'xprop-wmclass' };
  }

  if (title) {
    const t = title.toLowerCase();
    if (t.includes('settings') || t.includes('control center') || t.includes('gnome control')) return { app: 'Settings', reason: 'title-contains' };
    if (t.includes('terminal') || t.includes('bash') || t.includes('zsh') || t.includes('fish')) return { app: 'Terminal', reason: 'title-contains' };
    if (t.includes('file') || t.includes('nautilus') || t.includes('files')) return { app: 'Files', reason: 'title-contains' };
    if (t.includes('vscode') || t.includes('visual studio code')) return { app: 'VS Code', reason: 'title-contains' };
    if (t.includes('firefox') || t.includes('mozilla')) return { app: 'Firefox', reason: 'title-contains' };
    if (t.includes('chrome') || t.includes('brave')) return { app: 'Browser', reason: 'title-contains' };
  }

  return { app: titleCase(title || (rawOwnerName || 'unknown')), reason: 'fallback' };
}

async function getActiveWinRaw() {
  try {
    return await activeWin();
  } catch {
    return null;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function mainLoop() {
  console.log('[activewin-watcher] starting; POST ->', `http://${SERVER_HOST}:${SERVER_PORT}${SERVER_PATH}`);
  while (true) {
    try {
      const raw = await getActiveWinRaw();
      if (!raw) { await sleep(POLL_MS); continue; }

      const ownerName = (raw.owner && (raw.owner.name || raw.owner.processName)) || null;
      const ownerPath = (raw.owner && raw.owner.path) || null;
      const title = raw.title || null;
      const windowId = raw.id ?? raw.windowId ?? null;

      const norm = normalizeAppHeuristic(ownerName, ownerPath, title, windowId);
      const appNorm = norm.app;
      const now = Date.now();

      // stabilization / debounce
      if (lastSeen.app === appNorm && lastSeen.title === title) {
        if (now - lastSeen.at >= DEBOUNCE_MS && now - lastSentAt >= DEBOUNCE_MS) {
          const payload = {
            event: 'appSwitch',
            timestamp: now,
            prev: lastSeen.app ? { app: lastSeen.app, title: lastSeen.title } : null,
            next: { id: `${appNorm}-${now}`, app: appNorm, title: title || null, pid: raw.owner?.processId ?? null },
            context: { reason: 'active-win-improved', confidence: 1.0, heuristic: norm.reason },
            source: { watcherId: 'activewin-watcher-improved', hostId: os.hostname() }
          };

          try {
            await postJson(payload);
            console.log('[activewin-watcher] posted ->', payload.next.app, payload.next.title ? `(${payload.next.title})` : '', 'via', norm.reason);
            lastSentAt = now;
          } catch (e) {
            console.warn('[activewin-watcher] post failed:', e && e.message ? e.message : e);
          }
        }
      } else {
        // new candidate
        if (!['Chrome','Brave','VS Code','Firefox'].includes(appNorm)) {
          console.log('[activewin-watcher] candidate ->', appNorm, title || '', 'raw owner:', JSON.stringify(raw.owner || {}));
        } else {
          console.log('[activewin-watcher] candidate ->', appNorm, title || '');
        }
        lastSeen = { app: appNorm, title: title, at: now };
      }
    } catch (e) {
      console.warn('[activewin-watcher] loop err', e && e.message ? e.message : e);
    }
    await sleep(POLL_MS);
  }
}

mainLoop().catch(e => {
  console.error('[activewin-watcher] fatal', e && e.stack ? e.stack : e);
  process.exit(1);
});
