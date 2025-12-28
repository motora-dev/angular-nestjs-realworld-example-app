import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';

import { SpinnerFacade } from '$modules/spinner';
import { SpinnerState } from '$modules/spinner/store';
import { SpinnerComponent } from './spinner';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let mockSpinnerFacade: {
    isLoading$: BehaviorSubject<boolean>;
    message$: BehaviorSubject<string | null>;
  };

  beforeEach(async () => {
    mockSpinnerFacade = {
      isLoading$: new BehaviorSubject<boolean>(false),
      message$: new BehaviorSubject<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [provideStore([SpinnerState]), { provide: SpinnerFacade, useValue: mockSpinnerFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isLoading', () => {
    it('should reflect loading state from facade', async () => {
      expect(component.isLoading()).toBe(false);

      mockSpinnerFacade.isLoading$.next(true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isLoading()).toBe(true);

      mockSpinnerFacade.isLoading$.next(false);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isLoading()).toBe(false);
    });
  });

  describe('message', () => {
    it('should reflect message from facade', async () => {
      expect(component.message()).toBeNull();

      mockSpinnerFacade.message$.next('Loading...');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.message()).toBe('Loading...');

      mockSpinnerFacade.message$.next(null);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.message()).toBeNull();
    });
  });
});
