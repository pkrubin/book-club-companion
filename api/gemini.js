// Vercel Serverless Function - Secure Gemini API Proxy
// This runs server-side, so the API key is never exposed to the browser.

import { parseJsonBody, requireAuthenticatedUser } from './_auth.js';

const MAX_PROMPT_CHARS = 12000;
const MAX_OUTPUT_TOKENS = 4000;
const MAX_IMAGE_BASE64_CHARS = 7_000_000;
const MAX_RESPONSE_SCHEMA_CHARS = 8_000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authUser = await requireAuthenticatedUser(req, res);
    if (!authUser?.id) return;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const body = parseJsonBody(req.body);
    if (body === null) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const imageData = typeof body.imageData === 'string' ? body.imageData.trim() : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim() : '';
    const responseMimeType = typeof body.responseMimeType === 'string' ? body.responseMimeType.trim() : '';
    const responseJsonSchema = body.responseJsonSchema && typeof body.responseJsonSchema === 'object'
        ? body.responseJsonSchema
        : null;
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

    if (responseMimeType && !['application/json', 'text/plain'].includes(responseMimeType)) {
        return res.status(400).json({ error: 'Unsupported response MIME type.' });
    }

    if (responseJsonSchema) {
        const serializedSchema = JSON.stringify(responseJsonSchema);
        if (serializedSchema.length > MAX_RESPONSE_SCHEMA_CHARS) {
            return res.status(400).json({ error: 'Response schema is too large.' });
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
                            generationConfig: {
                                temperature,
                                maxOutputTokens: maxTokens,
                                ...(responseMimeType ? { responseMimeType } : {}),
                                ...(responseJsonSchema ? { responseJsonSchema } : {})
                            }
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
