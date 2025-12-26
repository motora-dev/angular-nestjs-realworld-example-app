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
 * Button variants definition (shadcn/ui pattern)
 */
export const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
   transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

/**
 * Button component (shadcn/ui style for Angular)
 *
 * @example
 * ```html
 * <button appButton>Default</button>
 * <button appButton variant="destructive">Delete</button>
 * <button appButton variant="outline" size="sm">Small</button>
 * <button appButton variant="ghost" size="icon">
 *   <svg>...</svg>
 * </button>
 * ```
 */
@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly destroyRef = inject(DestroyRef);

  /** Button variant */
  readonly variant = input<ButtonVariants['variant']>('default');

  /** Button size */
  readonly size = input<ButtonVariants['size']>('default');

  /** Additional CSS classes */
  readonly class = input<string>('');

  /** Computed class combining variants and custom classes */
  readonly computedClass = computed(() =>
    cn(
      buttonVariants({
        variant: this.variant(),
        size: this.size(),
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
