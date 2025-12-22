import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetTagsQuery } from './get-tags.query';
import { TagsDto } from '../../dto';
import { ArticleListService } from '../../services/article-list.service';

@QueryHandler(GetTagsQuery)
export class GetTagsHandler implements IQueryHandler<GetTagsQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute(): Promise<TagsDto> {
    return this.service.getTags();
  }
}
