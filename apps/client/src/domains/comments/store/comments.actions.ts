import { Comment } from '../model';

export class SetComments {
  static readonly type = '[Comments] Set Comments';
  constructor(public comments: Comment[]) {}
}

export class AddComment {
  static readonly type = '[Comments] Add Comment';
  constructor(public comment: Comment) {}
}

export class RemoveComment {
  static readonly type = '[Comments] Remove Comment';
  constructor(public commentId: string) {}
}

export class ClearComments {
  static readonly type = '[Comments] Clear Comments';
}
