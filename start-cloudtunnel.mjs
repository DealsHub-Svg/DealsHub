import 'dotenv/config';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

const VITE_PORT = 5173;
const API_PORT = parseInt(process.env.PORT || '5001', 10);
const TRY_CLOUDFLARE_RE = /https:\/\/[a-zA-Z0-9.-]+\.trycloudflare\.com/;

function waitForHttp(url, { maxMs = 90_000, intervalMs = 400 } = {}) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      fetch(url)
        .then((r) => {
          if (r.ok) resolve();
          else if (Date.now() - start > maxMs) reject(new Error(`Timeout: ${url} (status ${r.status})`));
          else setTimeout(tryOnce, intervalMs);
        })
        .catch(() => {
          if (Date.now() - start > maxMs) reject(new Error(`Timeout waiting for ${url}`));
          else setTimeout(tryOnce, intervalMs);
        });
    };
    tryOnce();
  });
}

const children = [];

function shutdown() {
  for (const c of children) {
    try {
      c.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

async function main() {
  console.log('Starting backend…');
  const server = spawn('node', ['server.js'], { stdio: 'inherit' });
  children.push(server);

  await waitForHttp(`http://127.0.0.1:${API_PORT}/health`);
  console.log(`Backend up on port ${API_PORT}`);

  console.log(`Starting Vite on port ${VITE_PORT}…`);
  const vite = spawn('npx', ['vite', '--host', '--port', String(VITE_PORT), '--strictPort'], {
    stdio: 'inherit',
  });
  children.push(vite);

  await waitForHttp(`http://127.0.0.1:${VITE_PORT}/`);
  console.log('Vite ready');

  console.log('Starting Cloudflare quick tunnel (no ngrok account required)…');
  const cf = spawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', `http://127.0.0.1:${VITE_PORT}`], {
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  children.push(cf);

  let out = '';
  let urlPrinted = false;
  const onChunk = (chunk, stream) => {
    const s = chunk.toString();
    stream.write(s);
    out += s;
    if (urlPrinted) return;
    const m = out.match(TRY_CLOUDFLARE_RE);
    if (m) {
      urlPrinted = true;
      const url = m[0];
      fs.writeFileSync(path.join(__dirname, 'mobile_test_url.txt'), `${url}\n`);
      console.log(`\nMOBILE TEST LINK: ${url}\n`);
      console.log('Also saved to mobile_test_url.txt');
      console.log('For Expo, set mobile/constants/Config.ts API_BASE to this URL.\n');
    }
  };

  cf.stdout.on('data', (c) => onChunk(c, process.stdout));
  cf.stderr.on('data', (c) => onChunk(c, process.stderr));

  cf.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`cloudflared exited with code ${code}`);
    }
    shutdown();
    process.exit(code ?? 0);
  });

  server.on('exit', (code) => {
    if (code) console.error(`server.js exited with code ${code}`);
    shutdown();
    process.exit(code ?? 1);
  });

  vite.on('exit', (code) => {
    if (code) console.error(`vite exited with code ${code}`);
    shutdown();
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error(err);
  shutdown();
  process.exit(1);
});
