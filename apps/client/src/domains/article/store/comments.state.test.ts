import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it } from 'vitest';

import { Comment } from '../model';
import { AddComment, ClearCommentForm, ClearComments, RemoveComment, SetComments } from './comments.actions';
import { CommentsState } from './comments.state';

describe('CommentsState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([CommentsState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have empty comments array as initial state', () => {
      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual([]);
    });

    it('should have default comment form state', () => {
      const isInvalid = store.selectSnapshot(CommentsState.isCommentFormInvalid);
      const isDirty = store.selectSnapshot(CommentsState.isCommentFormDirty);
      expect(isInvalid).toBe(true);
      expect(isDirty).toBe(false);
    });
  });

  describe('getComments selector', () => {
    it('should return empty array when no comments are set', () => {
      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual([]);
    });

    it('should return comments when comments are set', () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          body: 'Test Comment 1',
          createdAt: new Date('2024-01-01'),
          author: {
            username: 'user1',
            bio: '',
            image: '',
            following: false,
          },
        },
        {
          id: '2',
          body: 'Test Comment 2',
          createdAt: new Date('2024-01-02'),
          author: {
            username: 'user2',
            bio: '',
            image: '',
            following: false,
          },
        },
      ];

      store.dispatch(new SetComments(mockComments));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual(mockComments);
    });
  });

  describe('isCommentFormInvalid selector', () => {
    it('should return true when form status is not VALID', () => {
      const isInvalid = store.selectSnapshot(CommentsState.isCommentFormInvalid);
      expect(isInvalid).toBe(true);
    });
  });

  describe('isCommentFormDirty selector', () => {
    it('should return false when form is not dirty', () => {
      const isDirty = store.selectSnapshot(CommentsState.isCommentFormDirty);
      expect(isDirty).toBe(false);
    });
  });

  describe('SetComments action', () => {
    it('should set comments in state', () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          body: 'Test Comment',
          createdAt: new Date('2024-01-01'),
          author: {
            username: 'testuser',
            bio: '',
            image: '',
            following: false,
          },
        },
      ];

      store.dispatch(new SetComments(mockComments));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual(mockComments);
    });

    it('should set empty comments array', () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          body: 'Test Comment',
          createdAt: new Date('2024-01-01'),
          author: {
            username: 'testuser',
            bio: '',
            image: '',
            following: false,
          },
        },
      ];

      store.dispatch(new SetComments(mockComments));
      store.dispatch(new SetComments([]));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual([]);
    });
  });

  describe('AddComment action', () => {
    it('should add comment to the beginning of comments array', () => {
      const existingComment: Comment = {
        id: '1',
        body: 'Existing Comment',
        createdAt: new Date('2024-01-01'),
        author: {
          username: 'user1',
          bio: '',
          image: '',
          following: false,
        },
      };

      const newComment: Comment = {
        id: '2',
        body: 'New Comment',
        createdAt: new Date('2024-01-02'),
        author: {
          username: 'user2',
          bio: '',
          image: '',
          following: false,
        },
      };

      store.dispatch(new SetComments([existingComment]));
      store.dispatch(new AddComment(newComment));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toHaveLength(2);
      expect(comments[0]).toEqual(newComment);
      expect(comments[1]).toEqual(existingComment);
    });

    it('should add comment to empty comments array', () => {
      const newComment: Comment = {
        id: '1',
        body: 'New Comment',
        createdAt: new Date('2024-01-01'),
        author: {
          username: 'testuser',
          bio: '',
          image: '',
          following: false,
        },
      };

      store.dispatch(new AddComment(newComment));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toHaveLength(1);
      expect(comments[0]).toEqual(newComment);
    });
  });

  describe('RemoveComment action', () => {
    it('should remove comment by id', () => {
      const comment1: Comment = {
        id: '1',
        body: 'Comment 1',
        createdAt: new Date('2024-01-01'),
        author: {
          username: 'user1',
          bio: '',
          image: '',
          following: false,
        },
      };

      const comment2: Comment = {
        id: '2',
        body: 'Comment 2',
        createdAt: new Date('2024-01-02'),
        author: {
          username: 'user2',
          bio: '',
          image: '',
          following: false,
        },
      };

      store.dispatch(new SetComments([comment1, comment2]));
      store.dispatch(new RemoveComment('1'));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toHaveLength(1);
      expect(comments[0]).toEqual(comment2);
    });

    it('should not remove comment when id does not match', () => {
      const comment: Comment = {
        id: '1',
        body: 'Comment',
        createdAt: new Date('2024-01-01'),
        author: {
          username: 'testuser',
          bio: '',
          image: '',
          following: false,
        },
      };

      store.dispatch(new SetComments([comment]));
      store.dispatch(new RemoveComment('999'));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toHaveLength(1);
      expect(comments[0]).toEqual(comment);
    });
  });

  describe('ClearComments action', () => {
    it('should clear all comments from state', () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          body: 'Comment 1',
          createdAt: new Date('2024-01-01'),
          author: {
            username: 'user1',
            bio: '',
            image: '',
            following: false,
          },
        },
        {
          id: '2',
          body: 'Comment 2',
          createdAt: new Date('2024-01-02'),
          author: {
            username: 'user2',
            bio: '',
            image: '',
            following: false,
          },
        },
      ];

      store.dispatch(new SetComments(mockComments));
      store.dispatch(new ClearComments());

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual([]);
    });

    it('should clear comments even when already empty', () => {
      store.dispatch(new ClearComments());

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual([]);
    });
  });

  describe('ClearCommentForm action', () => {
    it('should reset comment form to default state', () => {
      store.dispatch(new ClearCommentForm());

      const isInvalid = store.selectSnapshot(CommentsState.isCommentFormInvalid);
      const isDirty = store.selectSnapshot(CommentsState.isCommentFormDirty);
      expect(isInvalid).toBe(true);
      expect(isDirty).toBe(false);
    });
  });
});
