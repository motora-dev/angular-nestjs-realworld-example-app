export interface Article {
  id: string;
  title: string | null;
  tags: string[];
  createdAt: Date;
}
