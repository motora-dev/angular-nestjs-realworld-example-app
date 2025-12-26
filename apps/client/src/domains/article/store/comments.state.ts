import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { Comment, CommentFormState } from '../model';
import { AddComment, ClearCommentForm, ClearComments, RemoveComment, SetComments } from './comments.actions';

const defaultCommentForm: CommentFormState = {
  model: {
    body: '',
  },
  dirty: false,
  status: '',
  errors: {},
};

export interface CommentsStateModel {
  comments: Comment[];
  commentForm: CommentFormState;
}

@State<CommentsStateModel>({
  name: 'comments',
  defaults: {
    comments: [],
    commentForm: defaultCommentForm,
  },
})
@Injectable()
export class CommentsState {
  @Selector()
  static getComments(state: CommentsStateModel): Comment[] {
    return state.comments;
  }

  @Selector()
  static isCommentFormInvalid(state: CommentsStateModel): boolean {
    return state.commentForm.status !== 'VALID';
  }

  @Selector()
  static isCommentFormDirty(state: CommentsStateModel): boolean {
    return state.commentForm.dirty;
  }

  @Action(SetComments)
  setComments(ctx: StateContext<CommentsStateModel>, action: SetComments) {
    ctx.setState(patch({ comments: action.comments }));
  }

  @Action(AddComment)
  addComment(ctx: StateContext<CommentsStateModel>, action: AddComment) {
    const comments = [action.comment, ...ctx.getState().comments];
    ctx.setState(patch({ comments }));
  }

  @Action(RemoveComment)
  removeComment(ctx: StateContext<CommentsStateModel>, action: RemoveComment) {
    const comments = ctx.getState().comments.filter((c) => c.id !== action.commentId);
    ctx.setState(patch({ comments }));
  }

  @Action(ClearComments)
  clearComments(ctx: StateContext<CommentsStateModel>) {
    ctx.setState(patch({ comments: [] }));
  }

  @Action(ClearCommentForm)
  clearCommentForm(ctx: StateContext<CommentsStateModel>) {
    ctx.setState(patch({ commentForm: defaultCommentForm }));
  }
}
