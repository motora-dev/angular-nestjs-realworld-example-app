import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SitemapDto } from './contracts';
import { GetSitemapQuery } from './queries';

@ApiTags('Sitemap')
@Controller('sitemap')
export class SitemapController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get sitemap',
    description: 'Get sitemap data with all articles',
  })
  @ApiOkResponse({ description: 'Sitemap data retrieved successfully', type: SitemapDto })
  @Get('')
  @HttpCode(HttpStatus.OK)
  async getSitemap(): Promise<SitemapDto> {
    return await this.queryBus.execute(new GetSitemapQuery());
  }
}
