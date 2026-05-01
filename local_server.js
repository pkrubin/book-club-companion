// Local Development Server (Mimics Vercel)
// Usage: node local_server.js
// Access: http://localhost:8080

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import booksHandler from './api/books.js';
import geminiHandler from './api/gemini.js';
import goodreadsHandler from './api/goodreads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOST = process.env.HOST || '127.0.0.1';
const portFromEnv = Number.parseInt(process.env.PORT || '', 10);
const PORT = Number.isInteger(portFromEnv) && portFromEnv > 0 ? portFromEnv : 8080;

function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) continue;

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

loadEnvFile(path.join(__dirname, '.env.local'));

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp'
};

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

function createHandlerResponse(res) {
    return {
        status(code) {
            return {
                json(payload) {
                    sendJson(res, code, payload);
                }
            };
        }
    };
}

function serveStaticFile(res, pathname) {
    const requestedPath = pathname === '/' ? '/index.html' : pathname;
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(__dirname, normalizedPath);

    if (!filePath.startsWith(__dirname)) {
        sendJson(res, 403, { error: 'Forbidden' });
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            if (error.code === 'ENOENT') {
                sendJson(res, 404, { error: 'Not found' });
                return;
            }
            sendJson(res, 500, { error: 'Failed to read file' });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function collectRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON body'));
            }
        });

        req.on('error', reject);
    });
}

async function dispatchJsonHandler(req, res, handler, { body = null, query = null } = {}) {
    const handlerReq = {
        method: req.method,
        headers: req.headers,
        body,
        query
    };

    await handler(handlerReq, createHandlerResponse(res));
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

    try {
        if (req.method === 'POST' && url.pathname === '/api/gemini') {
            const body = await collectRequestBody(req);
            await dispatchJsonHandler(req, res, geminiHandler, { body });
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/books') {
            const query = Object.fromEntries(url.searchParams.entries());
            await dispatchJsonHandler(req, res, booksHandler, { query });
            return;
        }

        if (req.method === 'GET' && url.pathname === '/api/goodreads') {
            const query = Object.fromEntries(url.searchParams.entries());
            await dispatchJsonHandler(req, res, goodreadsHandler, { query });
            return;
        }

        if (req.method === 'GET' || req.method === 'HEAD') {
            serveStaticFile(res, url.pathname);
            return;
        }

        sendJson(res, 405, { error: 'Method not allowed' });
    } catch (error) {
        console.error('Local server error:', error);
        sendJson(res, 500, { error: error.message || 'Internal Server Error in Local Proxy' });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`
Local Server Running
------------------------
URL: http://${HOST}:${PORT}
Gemini API: http://${HOST}:${PORT}/api/gemini
Books API: http://${HOST}:${PORT}/api/books?q=the%20hobbit
Goodreads API: http://${HOST}:${PORT}/api/goodreads?q=the%20hobbit
Gemini Key: ${process.env.GEMINI_API_KEY ? 'Loaded YES' : 'Missing NO'}
Books Key: ${process.env.GOOGLE_BOOKS_API_KEY || process.env.GOOGLE_API_KEY || process.env.BOOKS_API_KEY ? 'Loaded YES' : 'Optional / Not Set'}
------------------------
Press Ctrl+C to stop.
    `);
});
