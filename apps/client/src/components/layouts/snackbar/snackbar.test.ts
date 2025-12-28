import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { SnackbarFacade } from '$modules/snackbar';
import { SnackbarState } from '$modules/snackbar/store';
import { SnackbarItem } from '$modules/snackbar/store/snackbar.state';
import { SnackbarComponent } from './snackbar';

describe('SnackbarComponent', () => {
  let component: SnackbarComponent;
  let fixture: ComponentFixture<SnackbarComponent>;
  let mockSnackbarFacade: {
    snackbars$: BehaviorSubject<SnackbarItem[]>;
    hideSnackbar: ReturnType<typeof vi.fn>;
  };

  const mockSnackbarItem: SnackbarItem = {
    id: 'test-id',
    message: 'Test message',
    type: 'info',
    duration: 3000,
    createdAt: Date.now(),
  };

  beforeEach(async () => {
    mockSnackbarFacade = {
      snackbars$: new BehaviorSubject<SnackbarItem[]>([]),
      hideSnackbar: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SnackbarComponent],
      providers: [provideStore([SnackbarState]), { provide: SnackbarFacade, useValue: mockSnackbarFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clear all timers
    vi.clearAllTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('snackbars', () => {
    it('should reflect snackbars from facade', async () => {
      expect(component.snackbars()).toEqual([]);

      mockSnackbarFacade.snackbars$.next([mockSnackbarItem]);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.snackbars()).toEqual([mockSnackbarItem]);
    });
  });

  describe('onClose', () => {
    it('should call hideSnackbar with id after timeout', async () => {
      component.onClose('test-id');
      // hideSnackbar is called after setTimeout, so wait a bit
      await new Promise((resolve) => setTimeout(resolve, 250));
      expect(mockSnackbarFacade.hideSnackbar).toHaveBeenCalledWith('test-id');
    });

    it('should clear timer for the snackbar', () => {
      mockSnackbarFacade.snackbars$.next([mockSnackbarItem]);
      fixture.detectChanges();

      const timer = component['timers']().get('test-id');
      if (timer) {
        vi.spyOn(global, 'clearTimeout');
        component.onClose('test-id');
        expect(component['timers']().has('test-id')).toBe(false);
      }
    });
  });

  describe('isLeaving', () => {
    it('should return false for non-leaving snackbar', () => {
      expect(component.isLeaving('test-id')).toBe(false);
    });

    it('should return true for leaving snackbar', () => {
      component['leavingIds']().add('test-id');
      fixture.detectChanges();
      expect(component.isLeaving('test-id')).toBe(true);
    });
  });

  describe('getTypeStyles', () => {
    it('should return styles for success type', () => {
      const styles = component.getTypeStyles('success');
      expect(styles).toContain('bg-green-50');
      expect(styles).toContain('text-green-800');
    });

    it('should return styles for error type', () => {
      const styles = component.getTypeStyles('error');
      expect(styles).toContain('bg-red-50');
      expect(styles).toContain('text-red-800');
    });

    it('should return styles for info type', () => {
      const styles = component.getTypeStyles('info');
      expect(styles).toContain('bg-blue-50');
      expect(styles).toContain('text-blue-800');
    });

    it('should return styles for warning type', () => {
      const styles = component.getTypeStyles('warning');
      expect(styles).toContain('bg-yellow-50');
      expect(styles).toContain('text-yellow-800');
    });

    it('should include base styles for all types', () => {
      const styles = component.getTypeStyles('info');
      expect(styles).toContain('rounded-lg');
      expect(styles).toContain('shadow-lg');
      expect(styles).toContain('p-4');
    });
  });
});
