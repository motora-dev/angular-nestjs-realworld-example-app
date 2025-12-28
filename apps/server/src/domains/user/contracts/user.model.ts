import { Prisma } from '@monorepo/database/client';

/**
 * Prisma select definitions for consistent queries
 */
export const userWithAccountSelect = {
  id: true,
  email: true,
  username: true,
  bio: true,
  image: true,
} as const;

/**
 * DB type aliases (derived from Prisma)
 */
export type UserWithAccount = Prisma.UserGetPayload<{
  select: typeof userWithAccountSelect;
}>;
