/**
 * Extract token from URL query string
 * @param url The complete URL
 * @returns The extracted token or null if not found
 */
export function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    if (token) {
      return token;
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
  }
  return null;
}

/**
 * Get the base URL for the application
 * @returns The base URL
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // For server-side rendering
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
