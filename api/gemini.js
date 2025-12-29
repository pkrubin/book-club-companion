// Vercel Serverless Function - Secure Gemini API Proxy
// This runs server-side, so the API key is never exposed to the browser

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const { prompt, temperature = 0.7, maxTokens = 4000 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Gemini Proxy: Processing request');
    try {
        // Prioritize reasoning (3 Pro) -> Speed (3 Flash) -> Fallback (2.0/1.5)
        const MODELS = [
            'gemini-3-pro-preview',
            'gemini-3-flash-preview',
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash'
        ];
        let lastError = null;

        for (const model of MODELS) {
            console.log(`Gemini Proxy: Attempting model ${model}...`);
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature, maxOutputTokens: maxTokens }
                        })
                    }
                );

                if (!response.ok) {
                    const status = response.status;
                    const errorText = await response.text();
                    // If Rate Limit (429) or Not Found (404 - e.g. model doesn't exist yet), try next.
                    if (status === 429 || status === 404 || status === 503) {
                        console.warn(`Gemini Proxy: Model ${model} failed (${status}). Trying next...`);
                        lastError = { status, message: errorText };
                        continue;
                    }
                    // Other errors (400, 401) are fatal.
                    console.error(`Gemini Proxy: Fatal error on ${model}:`, errorText);
                    return res.status(status).json({ error: `Gemini Error (${model}): ${errorText}` });
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                console.log(`Gemini Proxy: Success with ${model}`);
                return res.status(200).json({ text, modelUsed: model });

            } catch (error) {
                console.error(`Gemini Proxy: Network error on ${model}:`, error);
                lastError = { status: 500, message: error.message };
            }
        }

        // If we get here, all models failed
        console.error('Gemini Proxy: All models exhausted.');
        return res.status(lastError?.status || 500).json({
            error: `All AI models busy or quota exceeded. Last error: ${lastError?.message}`
        });
    } catch (error) {
        console.error('Gemini proxy internal error:', error);
        return res.status(500).json({ error: 'Failed to call Gemini API' });
    }
}
