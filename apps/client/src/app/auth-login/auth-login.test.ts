import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AuthFacade } from '$modules/auth';
import { AuthLoginComponent } from './auth-login';

describe('AuthLoginComponent', () => {
  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;
  let mockAuthFacade: {
    isAuthenticated$: BehaviorSubject<boolean>;
    login: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthFacade = {
      isAuthenticated$: isAuthenticatedSubject,
      login: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AuthLoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: Router, useValue: mockRouter },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to home if already authenticated', async () => {
      mockAuthFacade.isAuthenticated$.next(true);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not redirect if not authenticated', async () => {
      mockAuthFacade.isAuthenticated$.next(false);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not redirect on server platform', async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [AuthLoginComponent],
        providers: [
          provideRouter([]),
          { provide: AuthFacade, useValue: mockAuthFacade },
          { provide: Router, useValue: mockRouter },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AuthLoginComponent);
      component = fixture.componentInstance;

      mockAuthFacade.isAuthenticated$.next(true);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onGoogleLogin', () => {
    it('should call authFacade.login', () => {
      component.onGoogleLogin();

      expect(mockAuthFacade.login).toHaveBeenCalled();
    });
  });
});
