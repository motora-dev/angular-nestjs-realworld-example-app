import { Prisma } from '@monorepo/database/client';

/**
 * Prisma include definitions for consistent queries
 */
export const articleWithRelationsInclude = {
  user: {
    select: {
      id: true,
      username: true,
      bio: true,
      image: true,
    },
  },
  favorites: {
    select: { userId: true },
  },
  _count: {
    select: { favorites: true },
  },
} as const;

/**
 * DB type aliases (derived from Prisma)
 */
export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof articleWithRelationsInclude;
}>;
