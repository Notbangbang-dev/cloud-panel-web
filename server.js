'use strict';

/**
 * Cloud Panel website — tiny zero-dependency static server.
 * Serves ./public, with clean URLs (/docs -> docs.html) and a 404 fallback.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 8090;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.join(__dirname, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// Baseline security headers. The site loads only same-origin JS (/js/main.js)
// and CSS, uses inline style="" attributes, and links out to https sites, so
// this CSP is safe without breaking anything.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', CSP);
}

function resolvePath(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (p === '/' || p === '') p = '/index.html';
  else if (p === '/docs' || p === '/docs/') p = '/docs.html';
  else if (!path.extname(p)) {
    // Try "/foo" -> "/foo.html"
    const candidate = path.join(ROOT, p + '.html');
    if (fs.existsSync(candidate)) p = p + '.html';
  }
  const abs = path.join(ROOT, path.normalize(p));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null; // traversal guard
  return abs;
}

const server = http.createServer((req, res) => {
  setSecurityHeaders(res);
  const abs = resolvePath(req.url);
  if (!abs) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  fs.stat(abs, (err, stat) => {
    if (err || !stat.isFile()) {
      const notFound = path.join(ROOT, '404.html');
      if (fs.existsSync(notFound)) {
        res.writeHead(404, { 'Content-Type': TYPES['.html'] });
        fs.createReadStream(notFound).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 Not Found');
      }
      return;
    }
    const type = TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream';
    const headers = { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' };
    // Cache static assets, not HTML.
    headers['Cache-Control'] = type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600';
    res.writeHead(200, headers);
    fs.createReadStream(abs).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n  ☁  Cloud Panel website`);
  console.log(`  Local : http://localhost:${PORT}`);
  console.log(`  Tunnel: npm run tunnel   (cloudflared → public https URL)\n`);
});
