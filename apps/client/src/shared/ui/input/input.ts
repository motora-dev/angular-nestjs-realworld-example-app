import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ElementRef,
  effect,
  DestroyRef,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * Input variants definition (shadcn/ui pattern)
 */
export const inputVariants = cva(
  // Base styles
  `flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm
   transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
   placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
   disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;

/**
 * Input component (shadcn/ui style for Angular)
 *
 * @example
 * ```html
 * <input appInput placeholder="Enter text..." />
 * <input appInput [error]="hasError" placeholder="With error state" />
 * <input appInput type="email" placeholder="Email" />
 * ```
 */
@Component({
  selector: 'input[appInput], textarea[appInput]',
  standalone: true,
  template: ``,
  host: {
    '[class]': 'computedClass()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly destroyRef = inject(DestroyRef);

  /** Show error state */
  readonly error = input<boolean>(false);

  /** Additional CSS classes */
  readonly class = input<string>('');

  /** Computed class combining variants and custom classes */
  readonly computedClass = computed(() =>
    cn(
      inputVariants({
        variant: this.error() ? 'error' : 'default',
      }),
      this.class(),
    ),
  );

  constructor() {
    // Setup focus monitoring for a11y
    effect(() => {
      this.focusMonitor.monitor(this.elementRef, true);
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.focusMonitor.stopMonitoring(this.elementRef);
    });
  }
}
