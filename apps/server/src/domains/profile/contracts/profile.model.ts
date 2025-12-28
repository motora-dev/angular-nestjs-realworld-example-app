import { Prisma } from '@monorepo/database/client';

/**
 * Prisma select definitions for consistent queries
 */
export const userProfileSelect = {
  id: true,
  username: true,
  bio: true,
  image: true,
} as const;

/**
 * DB type aliases (derived from Prisma)
 */
export type UserProfile = Prisma.UserGetPayload<{
  select: typeof userProfileSelect;
}>;
