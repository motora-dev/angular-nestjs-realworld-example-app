import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './tag-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListComponent {
  readonly tags = input.required<string[]>();
  readonly tagClick = output<string>();

  onTagClick(tag: string): void {
    this.tagClick.emit(tag);
  }
}
