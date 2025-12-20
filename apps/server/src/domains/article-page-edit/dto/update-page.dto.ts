export class UpdatePageRequestDto {
  title: string;
  description: string;
  content: string;
}

export class UpdatePageResponseDto {
  id: string;
  title: string;
  description: string;
  content: string;
  level: number;
  order: number;
}
