import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Errors, ListErrorsComponent } from '$components/errors';
import { ArticleFacade } from '$domains/article';

interface ArticleForm {
  title: FormControl<string>;
  description: FormControl<string>;
  body: FormControl<string>;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, ListErrorsComponent],
  providers: [ArticleFacade],
  templateUrl: './editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleFacade = inject(ArticleFacade);

  readonly tagList = signal<string[]>([]);
  readonly errors = signal<Errors | null>(null);
  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);

  readonly articleForm = new FormGroup<ArticleForm>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly tagField = new FormControl<string>('', { nonNullable: true });

  private slug: string | null = null;

  constructor() {
    this.slug = this.route.snapshot.params['slug'];
    if (this.slug) {
      this.isEditMode.set(true);
      this.loadArticle(this.slug);
    }
  }

  private loadArticle(slug: string): void {
    this.articleFacade.loadArticle(slug);
    this.articleFacade.article$.subscribe((article) => {
      if (article) {
        this.articleForm.patchValue({
          title: article.title,
          description: article.description,
          body: article.body,
        });
        this.tagList.set(article.tagList);
      }
    });
  }

  addTag(): void {
    const tag = this.tagField.value.trim();
    if (tag && !this.tagList().includes(tag)) {
      this.tagList.update((tags) => [...tags, tag]);
    }
    this.tagField.reset('');
  }

  removeTag(tagToRemove: string): void {
    this.tagList.update((tags) => tags.filter((tag) => tag !== tagToRemove));
  }

  submitForm(): void {
    if (this.articleForm.invalid) return;

    this.isSubmitting.set(true);
    this.addTag();

    const articleData = {
      ...this.articleForm.value,
      tagList: this.tagList(),
    };

    const observable = this.slug
      ? this.articleFacade.updateArticle({ ...articleData, slug: this.slug })
      : this.articleFacade.createArticle(articleData);

    observable.subscribe({
      next: (article) => {
        this.router.navigate(['/article', article.slug]);
      },
      error: (err) => {
        this.errors.set(err);
        this.isSubmitting.set(false);
      },
    });
  }
}
