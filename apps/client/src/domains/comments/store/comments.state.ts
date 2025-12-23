import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Comment } from '../model';
import { AddComment, ClearComments, RemoveComment, SetComments } from './comments.actions';

export interface CommentsStateModel {
  comments: Comment[];
}

@State<CommentsStateModel>({
  name: 'comments',
  defaults: {
    comments: [],
  },
})
@Injectable()
export class CommentsState {
  @Selector()
  static getComments(state: CommentsStateModel): Comment[] {
    return state.comments;
  }

  @Action(SetComments)
  setComments(ctx: StateContext<CommentsStateModel>, action: SetComments) {
    ctx.patchState({ comments: action.comments });
  }

  @Action(AddComment)
  addComment(ctx: StateContext<CommentsStateModel>, action: AddComment) {
    const comments = [action.comment, ...ctx.getState().comments];
    ctx.patchState({ comments });
  }

  @Action(RemoveComment)
  removeComment(ctx: StateContext<CommentsStateModel>, action: RemoveComment) {
    const comments = ctx.getState().comments.filter((c) => c.id !== action.commentId);
    ctx.patchState({ comments });
  }

  @Action(ClearComments)
  clearComments(ctx: StateContext<CommentsStateModel>) {
    ctx.patchState({ comments: [] });
  }
}
