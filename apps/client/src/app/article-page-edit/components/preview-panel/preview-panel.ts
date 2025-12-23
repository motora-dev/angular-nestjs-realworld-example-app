import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './preview-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewPanelComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly markdown = input.required<string>();
  readonly previewHtml = signal<SafeHtml>('');

  constructor() {
    effect(() => {
      const content = this.markdown();
      this.updatePreview(content);
    });
  }

  private async updatePreview(markdown: string): Promise<void> {
    if (!markdown) {
      this.previewHtml.set('');
      return;
    }

    this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(markdown));
  }
}
