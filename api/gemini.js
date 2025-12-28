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

    const { prompt, temperature = 0.7, maxTokens = 300 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Gemini Proxy: Processing request');
    try {
        const model = 'gemini-flash-latest'; // Verified working model
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
            const errorText = await response.text();
            console.error('Gemini API Error:', response.status, errorText);
            return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Gemini Proxy: Success, generated text length:', text.length);

        return res.status(200).json({ text });
    } catch (error) {
        console.error('Gemini proxy internal error:', error);
        return res.status(500).json({ error: 'Failed to call Gemini API' });
    }
}
