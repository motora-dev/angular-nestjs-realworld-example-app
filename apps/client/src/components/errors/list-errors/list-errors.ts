import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface Errors {
  errors: { [key: string]: string };
}

@Component({
  selector: 'app-list-errors',
  standalone: true,
  templateUrl: './list-errors.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListErrorsComponent {
  readonly errors = input<Errors | null>(null);

  readonly errorList = computed(() => {
    const errors = this.errors();
    if (!errors?.errors) return [];
    return Object.keys(errors.errors).map((key) => `${key} ${errors.errors[key]}`);
  });
}
