const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://rqbtntzqqkekdzvfilos.supabase.co';
const SUPABASE_ANON_KEY =
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYnRudHpxcWtla2R6dmZpbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDEwMjUsImV4cCI6MjA4MDA3NzAyNX0.iKeTABH2Q_s9BjpMmigroSa0fqeyW8DDcmXRwDO0jjM';

export function getBearerToken(req) {
    const authHeader = req.headers?.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
}

export function parseJsonBody(body) {
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

export async function verifySupabaseSession(accessToken) {
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
        console.error('Auth check failed:', error);
        return null;
    }
}

export async function requireAuthenticatedUser(req, res) {
    const accessToken = getBearerToken(req);
    if (!accessToken) {
        res.status(401).json({ error: 'You must be signed in to use this feature.' });
        return null;
    }

    const authUser = await verifySupabaseSession(accessToken);
    if (!authUser?.id) {
        res.status(401).json({ error: 'Your session is no longer valid. Please sign in again.' });
        return null;
    }

    return authUser;
}
