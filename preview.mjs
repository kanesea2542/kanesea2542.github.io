import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.png':'image/png', '.step':'application/octet-stream' };
const allowed = new Set(['index.html', 'styles.css', 'script.js', 'assets/favicon.svg', 'assets/Sean_Kane_Resume.pdf', 'assets/sean-kane.jpg','projects/ble-beacon.html','projects/ble-beacon.css','projects/ble-beacon.js','assets/ble-beacon/board-overview.png','assets/ble-beacon/layout-no-pours.png','assets/ble-beacon/layout-pours.png','assets/ble-beacon/bare-board.png','assets/ble-beacon/assembled-board.png','assets/ble-beacon/schematic.pdf','assets/ble-beacon/schematic.png','assets/ble-beacon/board.step']);
['projects/board-scene.js','projects/board-viewer.js','assets/ble-beacon/board-model.json','assets/ble-beacon/board-model.bin','assets/vendor/three/three.module.min.js','assets/vendor/three/OrbitControls.js','assets/vendor/three/LICENSE.txt'].forEach(path=>allowed.add(path));
types['.json']='application/json';types['.bin']='application/octet-stream';types['.txt']='text/plain';
['assets/ble-beacon/altium-overview.png','assets/hp5004a/system-diagram.png','assets/hp5004a/wave.asdb','projects/hp5004a.html'].forEach(path=>allowed.add(path));
allowed.add('assets/hp5004a/waveform.png');
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const target = resolve(root, relative);
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep) || !allowed.has(relative)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const file = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(file);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
const port = Number(process.env.PORT) || 4173;
server.listen(port, '127.0.0.1', () => console.log(`Portfolio preview: http://localhost:${port}`));
