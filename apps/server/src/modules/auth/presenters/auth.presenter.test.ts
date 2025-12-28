import type { CurrentUserType } from '$decorators';
import { toRegisterResponse, toUserInfo, toUserResponse } from './auth.presenter';

import type { User } from '@monorepo/database/client';

describe('AuthPresenter', () => {
  describe('toUserResponse', () => {
    it('should convert CurrentUserType to UserResponse', () => {
      const currentUser: CurrentUserType = {
        id: 1,
        publicId: 'test-public-id',
        username: 'testuser',
      };

      const result = toUserResponse(currentUser);

      expect(result).toEqual({
        id: 'test-public-id',
        username: 'testuser',
      });
    });
  });

  describe('toRegisterResponse', () => {
    it('should convert User to RegisterResponse', () => {
      const user: User = {
        id: 1,
        publicId: 'test-public-id',
        username: 'testuser',
        email: 'test@example.com',
        bio: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = toRegisterResponse(user);

      expect(result).toEqual({
        id: 'test-public-id',
        username: 'testuser',
        email: 'test@example.com',
      });
    });
  });

  describe('toUserInfo', () => {
    it('should convert User to UserInfo with all fields', () => {
      const user: User = {
        id: 1,
        publicId: 'test-public-id',
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
        image: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = toUserInfo(user);

      expect(result).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
        image: 'https://example.com/image.jpg',
      });
    });

    it('should convert User to UserInfo with null bio and image', () => {
      const user: User = {
        id: 1,
        publicId: 'test-public-id',
        username: 'testuser',
        email: 'test@example.com',
        bio: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = toUserInfo(user);

      expect(result).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        bio: '',
        image: '',
      });
    });
  });
});
