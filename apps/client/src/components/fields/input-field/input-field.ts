import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { filter, merge, switchMap } from 'rxjs';

/** Default error messages for common validators */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: '入力は必須です',
  minlength: '文字数が足りません',
  maxlength: '文字数が多すぎます',
  email: 'メールアドレス形式で入力してください',
  pattern: '入力形式が正しくありません',
};

/**
 * InputFieldComponent - Composed component for form input with label and validation
 *
 * Wraps InputDirective (primitive) with:
 * - Label rendering
 * - Automatic error state binding to InputDirective
 * - Validation error message display
 *
 * @example
 * ```html
 * <app-input-field
 *   label="ユーザー名"
 *   [control]="form.controls.username"
 *   [messages]="{ required: '必須項目です' }"
 * >
 *   <input appInput formControlName="username" />
 * </app-input-field>
 * ```
 */
@Component({
  selector: 'app-input-field',
  standalone: true,
  templateUrl: './input-field.html',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFieldComponent {
  private readonly destroyRef = inject(DestroyRef);

  /** Label text for the input */
  readonly label = input<string>();

  /** HTML id attribute for the input (for label association) */
  readonly id = input<string>();

  /** Form control to monitor for validation state */
  readonly control = input<AbstractControl>();

  /** Custom error messages (merged with defaults) */
  readonly messages = input<Record<string, string>>({});

  /** Internal signal to track control state changes (for Zoneless compatibility) */
  private readonly controlState = signal(0);

  /** Merged error messages (custom + defaults) */
  private readonly mergedMessages = computed(() => ({
    ...DEFAULT_ERROR_MESSAGES,
    ...this.messages(),
  }));

  /** Whether to show error state */
  readonly showError = computed(() => {
    // Read controlState to trigger re-computation when control status changes
    this.controlState();
    const ctrl = this.control();
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  });

  /** Active error messages based on current validation errors */
  readonly activeErrorMessages = computed(() => {
    // Read controlState to trigger re-computation when control status changes
    this.controlState();
    const ctrl = this.control();
    if (!ctrl?.errors) return [];

    const msgs = this.mergedMessages();
    return Object.keys(ctrl.errors).map((key) => {
      // Handle minlength/maxlength with actual values
      if (key === 'minlength') {
        const error = ctrl.errors?.['minlength'];
        return `${error.requiredLength}文字以上で入力してください`;
      }
      if (key === 'maxlength') {
        const error = ctrl.errors?.['maxlength'];
        return `${error.requiredLength}文字以内で入力してください`;
      }
      return msgs[key] ?? `${key} エラー`;
    });
  });

  constructor() {
    // Subscribe to control changes to update signal (Zoneless compatibility)
    // Monitor both statusChanges and events (for touched/dirty state changes)
    toObservable(this.control)
      .pipe(
        filter((ctrl): ctrl is AbstractControl => ctrl !== undefined),
        switchMap((ctrl) => merge(ctrl.statusChanges, ctrl.events)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        // Increment to trigger signal update
        this.controlState.update((v) => v + 1);
      });
  }
}
