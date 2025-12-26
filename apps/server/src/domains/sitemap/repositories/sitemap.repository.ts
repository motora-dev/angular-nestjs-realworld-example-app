import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

@Injectable()
export class SitemapRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getSitemapData() {
    return await this.prisma.article.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
