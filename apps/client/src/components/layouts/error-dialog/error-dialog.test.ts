import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AppError } from '$modules/error';
import { ErrorFacade } from '$modules/error';
import { ErrorState } from '$modules/error/store';
import { ErrorDialogComponent } from './error-dialog';

describe('ErrorDialogComponent', () => {
  let component: ErrorDialogComponent;
  let fixture: ComponentFixture<ErrorDialogComponent>;
  let mockErrorFacade: {
    error$: BehaviorSubject<AppError | null>;
    clearError: ReturnType<typeof vi.fn>;
  };

  const mockApiError: AppError = {
    type: 'api',
    errorCode: 'UNAUTHORIZED',
    message: 'Authentication required',
  };

  beforeEach(async () => {
    mockErrorFacade = {
      error$: new BehaviorSubject<AppError | null>(null),
      clearError: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ErrorDialogComponent],
      providers: [provideStore([ErrorState]), { provide: ErrorFacade, useValue: mockErrorFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('error', () => {
    it('should reflect error from facade', async () => {
      expect(component.error()).toBeNull();

      mockErrorFacade.error$.next(mockApiError);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.error()).toEqual(mockApiError);
    });
  });

  describe('errorMessage', () => {
    it('should return error message for api error', async () => {
      mockErrorFacade.error$.next(mockApiError);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.errorMessage()).toBeTruthy();
      expect(typeof component.errorMessage()).toBe('string');
    });

    it('should return default message when error is null', () => {
      mockErrorFacade.error$.next(null);
      fixture.detectChanges();

      expect(component.errorMessage()).toBeTruthy();
      expect(typeof component.errorMessage()).toBe('string');
    });

    it('should return default message for unexpected error type', async () => {
      const clientError: AppError = {
        type: 'client',
        message: 'Client error',
      };
      mockErrorFacade.error$.next(clientError);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.errorMessage()).toBeTruthy();
      expect(typeof component.errorMessage()).toBe('string');
    });
  });

  describe('close', () => {
    it('should call errorFacade.clearError', () => {
      component.close();
      expect(mockErrorFacade.clearError).toHaveBeenCalled();
    });
  });
});
