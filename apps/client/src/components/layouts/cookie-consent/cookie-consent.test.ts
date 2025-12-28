import { PLATFORM_ID, signal, Signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { CookieConsentService, ConsentStatus } from '$modules/cookie-consent';
import { CookieConsentComponent } from './cookie-consent';

describe('CookieConsentComponent', () => {
  let component: CookieConsentComponent;
  let fixture: ComponentFixture<CookieConsentComponent>;
  let mockCookieConsentService: {
    consent: Signal<ConsentStatus>;
    isLoading: Signal<boolean>;
    acceptConsent: ReturnType<typeof vi.fn>;
    rejectConsent: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const consentSignal = signal<ConsentStatus>(null);
    const isLoadingSignal = signal<boolean>(false);

    mockCookieConsentService = {
      consent: consentSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
      acceptConsent: vi.fn(),
      rejectConsent: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CookieConsentComponent],
      providers: [
        provideRouter([]),
        { provide: CookieConsentService, useValue: mockCookieConsentService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Cleanup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('accept', () => {
    it('should call cookieConsentService.acceptConsent', () => {
      component.accept();
      expect(mockCookieConsentService.acceptConsent).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should call cookieConsentService.rejectConsent', () => {
      component.reject();
      expect(mockCookieConsentService.rejectConsent).toHaveBeenCalled();
    });
  });

  describe('observables', () => {
    it('should expose consent from service', () => {
      expect(component.consent).toBeDefined();
      expect(component.consent()).toBeNull();
    });

    it('should expose isLoading from service', () => {
      expect(component.isLoading).toBeDefined();
      expect(component.isLoading()).toBe(false);
    });
  });
});
