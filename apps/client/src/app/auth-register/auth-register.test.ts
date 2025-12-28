import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { AuthRegisterFacade } from '$domains/auth-register';
import { AuthRegisterState } from '$domains/auth-register/store';
import { AuthState } from '$modules/auth/store';
import { SpinnerFacade } from '$modules/spinner';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { AuthRegisterComponent } from './auth-register';

describe('AuthRegisterComponent', () => {
  let component: AuthRegisterComponent;
  let fixture: ComponentFixture<AuthRegisterComponent>;
  let httpMock: HttpTestingController;
  let mockAuthRegisterFacade: {
    pendingRegistrationEmail$: BehaviorSubject<string | null>;
    loadPendingRegistration: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };
  let mockSpinnerFacade: {
    isLoading$: BehaviorSubject<boolean>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const pendingEmailSubject = new BehaviorSubject<string | null>(null);
    const isLoadingSubject = new BehaviorSubject<boolean>(false);

    mockAuthRegisterFacade = {
      pendingRegistrationEmail$: pendingEmailSubject,
      loadPendingRegistration: vi.fn(),
      register: vi.fn(() =>
        of({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            bio: '',
            image: '',
          },
        }),
      ),
    };

    mockSpinnerFacade = {
      isLoading$: isLoadingSubject,
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AuthRegisterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([AuthRegisterState, AuthState, SpinnerState]),
        FormBuilder,
        { provide: AuthRegisterFacade, useValue: mockAuthRegisterFacade },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    // Get actual router instance and spy on navigate
    const router = TestBed.inject(Router);
    mockRouter.navigate = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(AuthRegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadPendingRegistration on construction', () => {
    expect(mockAuthRegisterFacade.loadPendingRegistration).toHaveBeenCalled();
  });

  describe('registerForm', () => {
    it('should be invalid initially', () => {
      expect(component.registerForm.invalid).toBe(true);
    });

    it('should be valid with valid inputs', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        agreeToTerms: true,
      });

      expect(component.registerForm.valid).toBe(true);
    });

    it('should require username', () => {
      component.registerForm.patchValue({
        username: '',
        agreeToTerms: true,
      });

      expect(component.registerForm.controls.username.hasError('required')).toBe(true);
    });

    it('should require username minimum length of 3', () => {
      component.registerForm.patchValue({
        username: 'ab',
        agreeToTerms: true,
      });

      expect(component.registerForm.controls.username.hasError('minlength')).toBe(true);
    });

    it('should validate username pattern', () => {
      component.registerForm.patchValue({
        username: 'test-user',
        agreeToTerms: true,
      });

      expect(component.registerForm.controls.username.hasError('pattern')).toBe(true);
    });

    it('should require agreeToTerms', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        agreeToTerms: false,
      });

      expect(component.registerForm.controls.agreeToTerms.hasError('required')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();

      expect(mockAuthRegisterFacade.register).not.toHaveBeenCalled();
      expect(component.registerForm.touched).toBe(true);
    });

    it('should call register and navigate on valid form submission', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        agreeToTerms: true,
      });

      component.onSubmit();

      expect(mockAuthRegisterFacade.register).toHaveBeenCalledWith('testuser');
    });

    it('should navigate to home after successful registration', async () => {
      component.registerForm.patchValue({
        username: 'testuser',
        agreeToTerms: true,
      });

      component.onSubmit();

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('pendingEmail$', () => {
    it('should expose pendingRegistrationEmail$ from facade', async () => {
      let email: string | null = null;
      component.pendingEmail$.subscribe((value) => {
        email = value;
      });

      expect(email).toBe(null);

      mockAuthRegisterFacade.pendingRegistrationEmail$.next('test@example.com');
      expect(email).toBe('test@example.com');
    });
  });

  describe('isLoading$', () => {
    it('should expose isLoading$ from spinnerFacade', async () => {
      let isLoading = false;
      component.isLoading$.subscribe((value) => {
        isLoading = value;
      });

      expect(isLoading).toBe(false);

      mockSpinnerFacade.isLoading$.next(true);
      expect(isLoading).toBe(true);
    });
  });
});
