import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { CookieConsentService } from '$modules/cookie-consent';
import { CookieSettingsButtonComponent } from './cookie-settings-button';

describe('CookieSettingsButtonComponent', () => {
  let component: CookieSettingsButtonComponent;
  let fixture: ComponentFixture<CookieSettingsButtonComponent>;
  let mockCookieConsentService: {
    resetConsent: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockCookieConsentService = {
      resetConsent: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CookieSettingsButtonComponent],
      providers: [{ provide: CookieConsentService, useValue: mockCookieConsentService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieSettingsButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call resetConsent when resetCookieSettings is called', () => {
    component.resetCookieSettings();

    expect(mockCookieConsentService.resetConsent).toHaveBeenCalled();
  });
});
