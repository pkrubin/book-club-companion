// Vercel Serverless Function - Goodreads rating proxy
// Fetches Goodreads search HTML server-side and extracts rating metadata.

function extractGoodreadsRating(html) {
    if (!html || html.length < 1000) return null;

    let rating = null;
    let count = null;

    const avgRatingMatch = html.match(/(\d\.\d{1,2})\s*avg\s*rating\s*(?:[—–-]|&mdash;|&#8212;)\s*([\d,]+(?:\.\d+)?)\s*(K|M)?\s*ratings/i);
    if (avgRatingMatch) {
        rating = Number.parseFloat(avgRatingMatch[1]);
        count = Number.parseFloat(avgRatingMatch[2].replace(/,/g, ''));
        if (avgRatingMatch[3] === 'K') count *= 1000;
        if (avgRatingMatch[3] === 'M') count *= 1000000;
        count = Math.round(count);
    }

    if (!rating) {
        const ratingValueMatch = html.match(/"ratingValue"\s*:\s*"?(\d\.\d{1,2})"?/);
        const ratingCountMatch = html.match(/"ratingCount"\s*:\s*"?(\d+)"?/);
        if (ratingValueMatch) rating = Number.parseFloat(ratingValueMatch[1]);
        if (ratingCountMatch) count = Number.parseInt(ratingCountMatch[1], 10);
    }

    if (!rating) {
        const miniRatingMatch = html.match(/class="[^"]*minirating[^"]*"[^>]*>[^<]*(\d\.\d{1,2})\s*(?:[—–-]|&mdash;|&#8212;)\s*([\d,]+)\s*ratings/i);
        if (miniRatingMatch) {
            rating = Number.parseFloat(miniRatingMatch[1]);
            count = Number.parseInt(miniRatingMatch[2].replace(/,/g, ''), 10);
        }
    }

    if (!rating) {
        const ariaMatch = html.match(/(?:aria-label|title)="[^"]*(\d\.\d{1,2})\s*(?:out of 5|stars|rating)[^"]*"/i);
        if (ariaMatch) rating = Number.parseFloat(ariaMatch[1]);
    }

    if (!rating || rating <= 0 || rating > 5) return null;

    return {
        rating: rating.toFixed(2),
        count: count || 0,
        source: 'goodreads'
    };
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const query = String(req.query?.q || '').trim();
    if (!query) {
        return res.status(400).json({ error: 'Missing required query parameter: q' });
    }

    const goodreadsUrl = `https://www.goodreads.com/search?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(goodreadsUrl, {
            headers: {
                Accept: 'text/html,application/xhtml+xml',
                'User-Agent': 'BookClubCompanion/1.0 (+https://book-club-companion.vercel.app)'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Goodreads request failed (${response.status})`
            });
        }

        const html = await response.text();
        const parsed = extractGoodreadsRating(html);

        if (!parsed) {
            return res.status(200).json({ rating: null, source: 'goodreads' });
        }

        return res.status(200).json(parsed);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch Goodreads rating',
            details: error.message
        });
    }
}
