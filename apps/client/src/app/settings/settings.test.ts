import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { SettingsFacade, SettingsFormModel } from '$domains/settings';
import { SettingsState } from '$domains/settings/store';
import { AuthFacade } from '$modules/auth';
import { AuthState } from '$modules/auth/store';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { SettingsComponent } from './settings';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockSettingsFacade: {
    loadSettingsForm: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
  };
  let mockAuthFacade: {
    logout: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockSettingsFacade = {
      loadSettingsForm: vi.fn(),
      updateUser: vi.fn(() =>
        of({
          username: 'testuser',
          email: 'test@example.com',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
        }),
      ),
    };

    mockAuthFacade = {
      logout: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([SettingsState, AuthState, SpinnerState]),
        { provide: SettingsFacade, useValue: mockSettingsFacade },
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: Router, useValue: mockRouter },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Skip HTTP mock verification since we're using mocked facades
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadSettingsForm on construction', () => {
    expect(mockSettingsFacade.loadSettingsForm).toHaveBeenCalled();
  });

  describe('onFormSubmit', () => {
    it('should call updateUser and navigate to profile', async () => {
      const formData: SettingsFormModel = {
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      component.onFormSubmit(formData);

      expect(mockSettingsFacade.updateUser).toHaveBeenCalledWith(formData);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile', 'testuser']);
    });
  });

  describe('logout', () => {
    it('should call authFacade.logout and navigate to home', () => {
      component.logout();

      expect(mockAuthFacade.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
