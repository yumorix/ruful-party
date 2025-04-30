import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip authentication for localhost
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    if (!isLocalhost) {
      // Get the authorization header
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !isValidAuthHeader(authHeader)) {
        // Return a response that asks for basic auth
        return new NextResponse('Authentication required', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
          },
        });
      }
    }
  }

  // Continue with the request if authentication is valid or not required
  return NextResponse.next();
}

// Helper function to validate the authorization header
function isValidAuthHeader(authHeader: string): boolean {
  // Basic authentication format: "Basic base64(username:password)"
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }

  // Extract the base64 encoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) {
    return false;
  }

  // Decode the credentials
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // Check if the credentials are valid using environment variables
  // These are exposed to the Edge runtime via next.config.ts
  const validUsername = process.env.BASIC_AUTH_USERNAME || 'admin';
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password';

  return username === validUsername && password === validPassword;
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/admin/:path*'],
};
