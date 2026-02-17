import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-faerion-token, x-emerite-token');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { endpoint } = req.query;

        if (!endpoint || typeof endpoint !== 'string') {
            return res.status(400).json({ error: 'Missing endpoint parameter' });
        }

        // Remove leading slash from endpoint if present to prevent double slashes
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        const targetUrl = `http://ryzen.heavencloud.in:2407/api/${cleanEndpoint}`;
        console.log(`[PROXY] ${req.method} to: ${targetUrl}`);

        // Get auth token from headers
        const token = req.headers['x-faerion-token'] || req.headers['x-emerite-token'] || req.headers['authorization'];

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = token.toString().startsWith('Bearer ') ? token.toString() : `Bearer ${token}`;
        }

        // Forward the request
        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();

        return res.status(response.status).json(data);
    } catch (error: any) {
        console.error('[PROXY] Error:', error);
        return res.status(500).json({ error: error.message || 'Proxy request failed' });
    }
}
