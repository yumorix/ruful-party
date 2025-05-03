/**
 * Validate the format of an access token
 * @param token The access token to validate
 * @returns True if the token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  // Token should be a 32-character hexadecimal string
  return /^[0-9a-f]{32}$/.test(token);
}

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
