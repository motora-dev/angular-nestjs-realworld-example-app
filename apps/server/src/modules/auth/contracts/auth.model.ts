/**
 * Auth Internal Models
 */

/**
 * JWT Access Token Payload
 */
export interface JwtPayload {
  id: number;
  publicId: string;
  username: string;
}

/**
 * Pending Registration Token Payload
 * Used during OAuth flow for new users
 */
export interface PendingRegistrationPayload {
  provider: string;
  sub: string;
  email: string;
}
