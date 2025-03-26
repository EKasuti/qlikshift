import { NextResponse } from "next/server";

export const allowedOrigins = ['https://qlikshift.vercel.app', 'http://localhost:3000'];

export function setCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}
