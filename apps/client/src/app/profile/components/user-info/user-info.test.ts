import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { Profile } from '$domains/profile';
import { UserInfoComponent } from './user-info';

describe('UserInfoComponent', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;

  const mockProfile: Profile = {
    username: 'testuser',
    bio: 'Test Bio',
    image: 'https://example.com/image.jpg',
    following: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept profile input', () => {
    fixture.componentRef.setInput('profile', mockProfile);
    fixture.detectChanges();

    expect(component.profile()).toEqual(mockProfile);
  });

  it('should default isCurrentUser to false', () => {
    fixture.componentRef.setInput('profile', mockProfile);
    fixture.detectChanges();

    expect(component.isCurrentUser()).toBe(false);
  });

  it('should accept isCurrentUser input', () => {
    fixture.componentRef.setInput('profile', mockProfile);
    fixture.componentRef.setInput('isCurrentUser', true);
    fixture.detectChanges();

    expect(component.isCurrentUser()).toBe(true);
  });

  it('should emit toggleFollow event when onToggleFollow is called', () => {
    const toggleFollowSpy = vi.fn();
    component.toggleFollow.subscribe(toggleFollowSpy);

    fixture.componentRef.setInput('profile', mockProfile);
    fixture.detectChanges();

    component.onToggleFollow();

    expect(toggleFollowSpy).toHaveBeenCalled();
  });
});
