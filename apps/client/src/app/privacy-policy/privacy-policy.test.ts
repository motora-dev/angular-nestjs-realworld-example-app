import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { SeoService } from '$modules/seo';
import { PrivacyPolicyComponent } from './privacy-policy';

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent;
  let fixture: ComponentFixture<PrivacyPolicyComponent>;
  let mockSeoService: {
    setPageMeta: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockSeoService = {
      setPageMeta: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyComponent],
      providers: [{ provide: SeoService, useValue: mockSeoService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setPageMeta on construction', () => {
    expect(mockSeoService.setPageMeta).toHaveBeenCalled();
    const callArgs = mockSeoService.setPageMeta.mock.calls[0][0];
    expect(typeof callArgs.title).toBe('string');
    expect(typeof callArgs.description).toBe('string');
    expect(callArgs.url).toBe('/privacy-policy');
  });
});
