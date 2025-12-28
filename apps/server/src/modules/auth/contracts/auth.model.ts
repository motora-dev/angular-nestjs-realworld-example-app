/* v8 ignore file */
/**
 * Auth Internal Models
 */

/**
 * JWT Access Token Payload
 */
export type JwtPayload = {
  id: number;
  publicId: string;
  username: string;
};

/**
 * Pending Registration Token Payload
 * Used during OAuth flow for new users
 */
export type PendingRegistrationPayload = {
  provider: string;
  sub: string;
  email: string;
};
