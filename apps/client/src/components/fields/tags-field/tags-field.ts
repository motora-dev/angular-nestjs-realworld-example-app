import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
 * TagsFieldComponent - Composed component for tags input with chip UI
 *
 * Implements ControlValueAccessor to work with Angular forms.
 * Displays tags as chips and allows adding/removing tags.
 *
 * @example
 * ```html
 * <app-tags-field
 *   label="タグ"
 *   [control]="form.controls.tags"
 * >
 * </app-tags-field>
 * ```
 */
@Component({
  selector: 'app-tags-field',
  standalone: true,
  templateUrl: './tags-field.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TagsFieldComponent,
      multi: true,
    },
  ],
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsFieldComponent implements ControlValueAccessor {
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

  /** Current tags array */
  readonly tags = signal<string[]>([]);

  /** Current input value */
  readonly inputValue = signal('');

  /** Input element reference */
  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');

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

  /** ControlValueAccessor implementation */
  private onChange = (_value: string[]) => {};
  private onTouchedCallback = () => {};

  /** Public method to handle blur event */
  handleBlur(): void {
    this.onTouchedCallback();
  }

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

    // Monitor control value changes for NGXS form plugin compatibility
    // NGXS form plugin may not call writeValue, so we need to watch valueChanges
    toObservable(this.control)
      .pipe(
        filter((ctrl): ctrl is AbstractControl => ctrl !== undefined),
        switchMap((ctrl) => {
          // Get initial value immediately
          const initialValue = ctrl.value;
          if (Array.isArray(initialValue)) {
            this.tags.set(initialValue);
          } else if (initialValue === null || initialValue === undefined) {
            this.tags.set([]);
          }
          // Then watch for changes
          return ctrl.valueChanges;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        // Update tags signal when control value changes
        if (Array.isArray(value)) {
          this.tags.set(value);
        } else if (value === null || value === undefined) {
          this.tags.set([]);
        }
      });
  }

  writeValue(value: string[]): void {
    this.tags.set(value || []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  /** Add a tag from input */
  addTag(): void {
    const value = this.inputValue().trim();
    if (!value) return;

    // Split by comma and add all tags
    const newTags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const currentTags = this.tags();
    const updatedTags = [...currentTags];

    for (const tag of newTags) {
      if (!updatedTags.includes(tag)) {
        updatedTags.push(tag);
      }
    }

    this.tags.set(updatedTags);
    this.inputValue.set('');
    this.onChange(updatedTags);
    this.onTouchedCallback();

    // Clear input field directly to ensure it's cleared immediately
    const inputEl = this.inputElement()?.nativeElement;
    if (inputEl) {
      inputEl.value = '';
    }
  }

  /** Remove a tag */
  removeTag(tag: string): void {
    const currentTags = this.tags();
    const updatedTags = currentTags.filter((t) => t !== tag);
    this.tags.set(updatedTags);
    this.onChange(updatedTags);
    this.onTouchedCallback();
  }

  /** Handle input keydown */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    } else if (event.key === 'Backspace' && this.inputValue() === '' && this.tags().length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const lastTag = this.tags()[this.tags().length - 1];
      this.removeTag(lastTag);
    }
  }

  /** Handle input change */
  onInputChange(value: string): void {
    this.inputValue.set(value);
  }
}
