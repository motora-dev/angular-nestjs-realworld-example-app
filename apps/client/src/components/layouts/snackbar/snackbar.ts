import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { SnackbarFacade } from '$modules/snackbar';
import { SnackbarItem } from '$modules/snackbar/store/snackbar.state';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  templateUrl: './snackbar.html',
  styleUrls: ['./snackbar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent {
  private readonly snackbarFacade = inject(SnackbarFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly snackbars = toSignal(this.snackbarFacade.snackbars$, { initialValue: [] });
  private readonly timers = signal<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  private readonly leavingIds = signal<Set<string>>(new Set());

  constructor() {
    // Set auto-hide timer for each Snackbar when snackbars change
    effect(() => {
      const currentSnackbars = this.snackbars();
      const currentTimers = this.timers();

      // Explicitly trigger change detection (after reading Signal in effect)
      this.cdr.markForCheck();

      // Clear existing timers
      currentTimers.forEach((timer, id) => {
        if (!currentSnackbars.find((item) => item.id === id)) {
          clearTimeout(timer);
          currentTimers.delete(id);
        }
      });

      // Set timer for new Snackbars
      currentSnackbars.forEach((item) => {
        if (!currentTimers.has(item.id)) {
          const timer = setTimeout(() => {
            // Apply leave animation
            this.leavingIds.update((ids) => new Set([...ids, item.id]));
            // Remove element after animation completes
            setTimeout(() => {
              this.snackbarFacade.hideSnackbar(item.id);
              this.leavingIds.update((ids) => {
                const newIds = new Set(ids);
                newIds.delete(item.id);
                return newIds;
              });
            }, 200); // Match leave animation duration
            currentTimers.delete(item.id);
            this.timers.set(new Map(currentTimers));
          }, item.duration);

          currentTimers.set(item.id, timer);
          this.timers.set(new Map(currentTimers));
        }
      });
    });
  }

  onClose(id: string): void {
    const currentTimers = this.timers();
    const timer = currentTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      currentTimers.delete(id);
      this.timers.set(new Map(currentTimers));
    }
    // Apply leave animation
    this.leavingIds.update((ids) => new Set([...ids, id]));
    // Remove element after animation completes
    setTimeout(() => {
      this.snackbarFacade.hideSnackbar(id);
      this.leavingIds.update((ids) => {
        const newIds = new Set(ids);
        newIds.delete(id);
        return newIds;
      });
    }, 200); // Match leave animation duration
  }

  isLeaving(id: string): boolean {
    return this.leavingIds().has(id);
  }

  getTypeStyles(type: SnackbarItem['type']): string {
    const baseStyles =
      'rounded-lg shadow-lg p-4 mb-3 flex items-center justify-between min-w-[300px] max-w-[500px] w-full';
    const typeStyles = {
      success: 'bg-green-50 border border-green-200 text-green-800',
      error: 'bg-red-50 border border-red-200 text-red-800',
      info: 'bg-blue-50 border border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    };
    return `${baseStyles} ${typeStyles[type]}`;
  }
}
