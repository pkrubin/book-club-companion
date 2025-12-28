// Local Development Server (Mimics Vercel)
// Usage: node local_server.js
// Access: http://localhost:8080

import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiHandler from './api/gemini.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies (mimicking Vercel's automatic parsing)
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Mock Vercel Request/Response objects for the API handler
app.post('/api/gemini', async (req, res) => {
    console.log('⚡️ API Request received: /api/gemini');
    if (req.body) {
        console.log('   Body preview:', JSON.stringify(req.body).substring(0, 150) + '...');
    } else {
        console.log('   Body is missing!');
    }

    try {
        await geminiHandler(req, res);
    } catch (error) {
        console.error('API Handler Error:', error);
        res.status(500).json({ error: 'Internal Server Error in Local Proxy' });
    }
});

app.listen(PORT, () => {
    console.log(`
🚀 Local Server Running!
------------------------
URL: http://localhost:${PORT}
API: http://localhost:${PORT}/api/gemini
Key: ${process.env.GEMINI_API_KEY ? 'Loaded ✅' : 'Missing ❌'}
------------------------
Press Ctrl+C to stop.
    `);
});
