export function setCorsHeaders(response: Response): Response {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
    }

    return response;
}
