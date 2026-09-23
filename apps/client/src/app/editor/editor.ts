import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EditorFacade, EditorFormModel } from '$domains/editor';
import { EditorFormComponent } from './components/editor-form';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [EditorFormComponent],
  templateUrl: './editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly editorFacade = inject(EditorFacade);

  private slug: string | null = this.route.snapshot.params['slug'] ?? null;

  constructor() {
    if (this.slug) {
      this.editorFacade.loadArticle(this.slug).subscribe();
    }
  }

  get isEditMode(): boolean {
    return this.slug !== null;
  }

  onFormSubmit(form: EditorFormModel): void {
    const articleData = {
      title: form.title,
      description: form.description,
      body: form.body,
      tagList: form.tagList,
    };

    const observable = this.slug
      ? this.editorFacade.updateArticle({ ...articleData, slug: this.slug })
      : this.editorFacade.createArticle(articleData);

    observable.subscribe({
      next: (article) => {
        this.router.navigate(['/article', article.slug]);
      },
    });
  }
}
