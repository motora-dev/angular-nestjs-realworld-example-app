import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { GetSitemapHandler } from './queries';
import { SitemapRepository } from './repositories';
import { SitemapService } from './services';
import { SitemapController } from './sitemap.controller';

const QueryHandlers = [GetSitemapHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [SitemapController],
  providers: [SitemapService, SitemapRepository, ...QueryHandlers],
})
export class SitemapModule {}
