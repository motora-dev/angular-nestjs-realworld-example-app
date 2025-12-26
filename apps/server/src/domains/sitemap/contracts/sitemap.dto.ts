export interface SitemapArticleDto {
  slug: string;
  updatedAt: string;
}

export interface SitemapDto {
  articles: SitemapArticleDto[];
}
