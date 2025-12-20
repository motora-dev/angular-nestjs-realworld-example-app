export class GetPagesPageItem {
  id: string;
  title: string;
  level: number;
  order: number;
}

export class GetPagesResponseDto {
  pages: GetPagesPageItem[];
}
