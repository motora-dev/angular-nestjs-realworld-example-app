import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EditorArticle, EditorFacade } from '$domains/editor';
import { EditorFormComponent, EditorFormSubmitEvent } from './components/editor-form';

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

  readonly isEditMode = signal(false);
  readonly initialTagList = signal<string[]>([]);

  private slug: string | null = null;

  constructor() {
    this.slug = this.route.snapshot.params['slug'];
    if (this.slug) {
      this.isEditMode.set(true);
      this.editorFacade.loadArticle(this.slug).subscribe((article: EditorArticle) => {
        this.initialTagList.set(article.tagList);
      });
    }
  }

  onFormSubmit(event: EditorFormSubmitEvent): void {
    const articleData = {
      title: event.title,
      description: event.description,
      body: event.body,
      tagList: event.tagList,
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
