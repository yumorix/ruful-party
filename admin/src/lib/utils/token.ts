import { createHash } from 'crypto';
import { ulid } from 'ulid';
import QRCode from 'qrcode';

/**
 * Generate a unique access token for a participant
 * @param partyId The party ID
 * @param name The participant name
 * @returns A unique access token
 */
export function generateAccessToken(partyId: string, name: string): string {
  const timestamp = Date.now().toString();
  const randomString = ulid();
  const hash = createHash('sha256');

  hash.update(`${partyId}:${name}:${timestamp}:${randomString}`);

  return hash.digest('hex').substring(0, 32);
}

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
 * Generate a QR code URL for an access token
 * @param token The access token
 * @param baseUrl The base URL of the application
 * @returns A data URL for the QR code
 */
export function generateQRCodeUrl(token: string, baseUrl: string): string {
  try {
    // Create a URL for the vote page with the token as a query parameter
    const voteUrl = `${baseUrl}/vote?token=${token}`;

    // For synchronous usage, return a placeholder
    // The actual QR code will be generated asynchronously in the component
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(voteUrl)}`;
  } catch (error) {
    console.error('Error generating QR code URL:', error);
    return '';
  }
}

/**
 * Generate a QR code data URL asynchronously
 * @param token The access token
 * @param baseUrl The base URL of the application
 * @returns A Promise that resolves to a data URL for the QR code
 */
export async function generateQRCodeDataUrl(token: string, baseUrl: string): Promise<string> {
  try {
    // Create a URL for the vote page with the token as a query parameter
    const voteUrl = `${baseUrl}/vote?token=${token}`;

    // Generate a QR code as a data URL
    return await QRCode.toDataURL(voteUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}
