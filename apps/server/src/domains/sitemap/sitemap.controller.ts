import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { SitemapDto } from './contracts';
import { GetSitemapQuery } from './queries';

@Controller('sitemap')
export class SitemapController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getSitemap(): Promise<SitemapDto> {
    return await this.queryBus.execute(new GetSitemapQuery());
  }
}
