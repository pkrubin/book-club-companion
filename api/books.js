// Vercel Serverless Function - Google Books API Proxy
// Keeps Google Books API key server-side (Vercel env/local .env.local)

import { requireAuthenticatedUser } from './_auth.js';

function clampInt(value, min, max, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGoogleBooksWithRetry(url, attempts = 3) {
    let lastResponse = null;
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' }
            });

            if (![502, 503, 504].includes(response.status) || attempt === attempts) {
                return response;
            }

            lastResponse = response;
        } catch (error) {
            lastError = error;
            if (attempt === attempts) {
                throw error;
            }
        }

        await sleep(250 * attempt);
    }

    if (lastResponse) return lastResponse;
    throw lastError || new Error('Google Books request failed');
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authUser = await requireAuthenticatedUser(req, res);
    if (!authUser?.id) return;

    const q = String(req.query?.q || '').trim();
    if (!q) {
        return res.status(400).json({ error: 'Missing required query parameter: q' });
    }
    if (q.length > 200) {
        return res.status(400).json({ error: 'Search query is too long' });
    }

    // Google Books public search can work without authentication.
    // Only include a key if a Books-specific one is configured.
    const booksApiKey =
        process.env.GOOGLE_BOOKS_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.BOOKS_API_KEY;

    const startIndex = clampInt(req.query?.startIndex, 0, 1000, 0);
    const maxResults = clampInt(req.query?.maxResults, 1, 40, 12);
    const langRestrict = String(req.query?.langRestrict || 'en').trim();

    const params = new URLSearchParams({
        q,
        startIndex: String(startIndex),
        maxResults: String(maxResults)
    });

    if (booksApiKey) params.set('key', booksApiKey);
    if (langRestrict) params.set('langRestrict', langRestrict);

    const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;

    try {
        console.log(`Books Proxy: ${authUser.id} searched for "${q.slice(0, 80)}"`);
        const upstreamResponse = await fetchGoogleBooksWithRetry(url);

        const text = await upstreamResponse.text();
        let payload;
        try {
            payload = JSON.parse(text);
        } catch {
            payload = { error: { message: 'Invalid response from Google Books API', raw: text } };
        }

        if (!upstreamResponse.ok) {
            if (upstreamResponse.status === 403 && booksApiKey) {
                return res.status(403).json({
                    error: {
                        message: 'Google Books rejected the configured API key',
                        hint: 'Set GOOGLE_BOOKS_API_KEY to a Google Books-enabled key, or remove the Books key to use public search locally.'
                    }
                });
            }
            return res.status(upstreamResponse.status).json(payload);
        }

        return res.status(200).json(payload);
    } catch (error) {
        return res.status(500).json({
            error: {
                message: 'Failed to fetch from Google Books API',
                details: error.message
            }
        });
    }
}
