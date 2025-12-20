export class UpdateArticleRequestDto {
  title: string;
  tags: string[];
  content: string;
}

export class UpdateArticleResponseDto {
  id: string;
  title: string;
  tags: string[];
  description: string;
}
