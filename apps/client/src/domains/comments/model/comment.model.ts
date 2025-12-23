import { Profile } from '$domains/profile';

export interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  author: Profile;
}
