// Vercel Serverless Function - Secure Gemini API Proxy
// This runs server-side, so the API key is never exposed to the browser.

const MAX_PROMPT_CHARS = 12000;
const MAX_OUTPUT_TOKENS = 4000;
const MAX_IMAGE_BASE64_CHARS = 7_000_000;
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://rqbtntzqqkekdzvfilos.supabase.co';
const SUPABASE_ANON_KEY =
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFyZSIsInJlZiI6InJxYnRudHpxcWtla2R6dmZpbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDEwMjUsImV4cCI6MjA4MDA3NzAyNX0.iKeTABH2Q_s9BjpMmigroSa0fqeyW8DDcmXRwDO0jjM';

function getBearerToken(req) {
    const authHeader = req.headers?.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
}

function parseJsonBody(body) {
    if (!body) return {};
    if (typeof body === 'string') {
        try {
            return JSON.parse(body);
        } catch {
            return null;
        }
    }
    return body;
}

async function verifySupabaseSession(accessToken) {
    if (!accessToken || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Gemini Proxy: Failed to verify Supabase session:', error);
        return null;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const accessToken = getBearerToken(req);
    if (!accessToken) {
        return res.status(401).json({ error: 'You must be signed in to use AI features.' });
    }

    const authUser = await verifySupabaseSession(accessToken);
    if (!authUser?.id) {
        return res.status(401).json({ error: 'Your session is no longer valid. Please sign in again.' });
    }

    const body = parseJsonBody(req.body);
    if (body === null) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const imageData = typeof body.imageData === 'string' ? body.imageData.trim() : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim() : '';
    const temperature = Number.isFinite(Number(body.temperature))
        ? Math.max(0, Math.min(1, Number(body.temperature)))
        : 0.7;
    const maxTokens = Number.isFinite(Number(body.maxTokens))
        ? Math.max(1, Math.min(MAX_OUTPUT_TOKENS, Math.floor(Number(body.maxTokens))))
        : MAX_OUTPUT_TOKENS;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (prompt.length > MAX_PROMPT_CHARS) {
        return res.status(413).json({ error: 'Prompt is too long. Please shorten it and try again.' });
    }

    if (imageData) {
        if (!mimeType.startsWith('image/')) {
            return res.status(400).json({ error: 'Unsupported image type.' });
        }

        if (imageData.length > MAX_IMAGE_BASE64_CHARS) {
            return res.status(413).json({ error: 'Image is too large. Please use a smaller image and try again.' });
        }
    }

    console.log(`Gemini Proxy: Processing request for user ${authUser.id}`);

    try {
        const MODELS = [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-3-flash-preview',
            'gemini-flash-latest'
        ];
        let lastError = null;
        let sawNetworkFailure = false;

        for (const model of MODELS) {
            console.log(`Gemini Proxy: Attempting model ${model} for user ${authUser.id}`);
            try {
                const parts = [{ text: prompt }];
                if (imageData) {
                    parts.push({
                        inline_data: {
                            mime_type: mimeType,
                            data: imageData
                        }
                    });
                }

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': GEMINI_API_KEY
                        },
                        body: JSON.stringify({
                            contents: [{ parts }],
                            generationConfig: { temperature, maxOutputTokens: maxTokens }
                        })
                    }
                );

                if (!response.ok) {
                    const status = response.status;
                    const errorText = await response.text();
                    if (status === 404 || status === 429 || status === 503) {
                        console.warn(`Gemini Proxy: Model ${model} failed (${status}). Trying next...`);
                        lastError = { status, message: errorText };
                        continue;
                    }

                    console.error(`Gemini Proxy: Fatal error on ${model}:`, errorText);
                    return res.status(status).json({ error: `Gemini Error (${model}): ${errorText}` });
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const finishReason = data.candidates?.[0]?.finishReason || null;
                console.log(`Gemini Proxy: Success with ${model} for user ${authUser.id}`);
                return res.status(200).json({ text, modelUsed: model, finishReason });
            } catch (error) {
                console.error(`Gemini Proxy: Network error on ${model}:`, error);
                sawNetworkFailure = true;
                lastError = { status: 500, message: error.message };
            }
        }

        console.error('Gemini Proxy: All models exhausted.');
        if (sawNetworkFailure) {
            return res.status(503).json({
                error: 'Could not reach the Gemini API. Check your internet connection, firewall, or local DNS settings and try again.'
            });
        }

        return res.status(lastError?.status || 500).json({
            error: `Gemini request failed after trying multiple models. Last error: ${lastError?.message}`
        });
    } catch (error) {
        console.error('Gemini proxy internal error:', error);
        return res.status(500).json({ error: 'Failed to call Gemini API' });
    }
}
