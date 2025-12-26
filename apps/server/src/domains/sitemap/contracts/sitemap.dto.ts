import { ApiProperty } from '@nestjs/swagger';

export class SitemapArticleDto {
  @ApiProperty({ description: 'Article slug', example: 'how-to-train-your-dragon' })
  slug: string;

  @ApiProperty({ description: 'Last update date (ISO 8601)', example: '2024-01-02T00:00:00.000Z' })
  updatedAt: string;
}

export class SitemapDto {
  @ApiProperty({ type: [SitemapArticleDto], description: 'List of articles for sitemap' })
  articles: SitemapArticleDto[];
}
