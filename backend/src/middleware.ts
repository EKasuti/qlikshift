// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'https://qlikshift.vercel.app'
];

export function middleware(req: NextRequest) {
    const origin = req.headers.get('origin');
    const isPreflight = req.method === 'OPTIONS';

    // Create a response either for preflight or the normal flow
    const response = isPreflight ? new NextResponse(null, { status: 200 }) : NextResponse.next();

    // Check if the request origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }

    // Set additional CORS headers
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

// Only run middleware for specific routes (e.g., API routes)
export const config = {
  matcher: '/api/:path*',
};
