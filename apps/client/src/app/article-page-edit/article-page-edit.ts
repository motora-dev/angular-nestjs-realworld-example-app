import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxsFormDirective } from '@ngxs/form-plugin';
import { RxLet } from '@rx-angular/template/let';
import { RxPush } from '@rx-angular/template/push';
import { EMPTY, switchMap, take } from 'rxjs';

import { ArticlePageEditFacade } from '$domains/article-page-edit';
import { NotFoundError } from '$modules/error';
import { SnackbarFacade } from '$modules/snackbar';
import { InputDirective } from '$shared/ui/input';
import { MarkdownEditorComponent, PageSidebarComponent, PreviewPanelComponent } from './components';

@Component({
  selector: 'app-article-page-edit',
  standalone: true,
  imports: [
    InputDirective,
    MarkdownEditorComponent,
    NgxsFormDirective,
    PageSidebarComponent,
    PreviewPanelComponent,
    ReactiveFormsModule,
    RxLet,
    RxPush,
    TranslatePipe,
  ],
  providers: [ArticlePageEditFacade],
  templateUrl: './article-page-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ArticlePageEditFacade);
  private readonly snackbarFacade = inject(SnackbarFacade);
  private readonly translate = inject(TranslateService);

  readonly pageId$ = this.facade.pageId$;
  readonly pages$ = this.facade.pages$;
  readonly content$ = this.facade.content$;

  readonly isFormInvalid$ = this.facade.isFormInvalid$;
  readonly isFormDirty$ = this.facade.isFormDirty$;
  readonly formValue$ = this.facade.formValue$;

  readonly form = this.fb.nonNullable.group({
    articleId: ['', [Validators.required]],
    pageId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    description: [''],
  });

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('articleId') || '';
    const pageId = this.route.snapshot.paramMap.get('pageId') || '';
    // articleIdがない場合は404エラーをthrow
    if (!articleId || !pageId) {
      throw new NotFoundError(this.translate.instant('articlePageEdit.errors.articleIdOrPageIdRequired'));
    }

    // ページ一覧を読み込む
    this.facade.loadPages(articleId);

    // 現在のページを読み込む
    this.facade.loadPage(articleId, pageId);

    // ルートパラメータの変更を監視
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const newArticleId = params.get('articleId') || '';
      const newPageId = params.get('pageId') || '';
      if (newArticleId && newPageId) {
        this.facade.loadPage(newArticleId, newPageId);
      }
    });
  }

  onSave(): void {
    this.facade.formValue$
      .pipe(
        take(1),
        switchMap((formValue) => {
          if (!formValue) {
            return EMPTY;
          }
          return this.facade.updatePage(formValue.articleId, formValue.pageId, {
            title: formValue.title,
            description: formValue.description,
            content: formValue.content,
          });
        }),
      )
      .subscribe(() => {
        this.snackbarFacade.showSnackbar('success', this.translate.instant('articlePageEdit.saveSuccess'));
      });
  }

  navigateToArticleEdit(): void {
    this.facade.formValue$.pipe(take(1)).subscribe((formValue) => {
      if (formValue) {
        this.router.navigate(['/article', formValue.articleId, 'edit']);
      }
    });
  }
}
