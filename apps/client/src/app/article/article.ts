import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxLet } from '@rx-angular/template/let';
import { RxPush } from '@rx-angular/template/push';

import { Article, ArticleFacade, Comment } from '$domains/article';
import { Profile } from '$domains/profile';
import { AuthFacade, User } from '$modules/auth';
import { MarkdownPipe } from '$shared/lib';
import { ArticleCommentComponent } from './components/article-comment/article-comment';
import { ArticleMetaComponent } from './components/article-meta/article-meta';
import { CommentFormComponent } from './components/comment-form/comment-form';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    RxLet,
    RxPush,
    RouterLink,
    TranslatePipe,
    MarkdownPipe,
    ArticleMetaComponent,
    ArticleCommentComponent,
    CommentFormComponent,
  ],
  providers: [ArticleFacade],
  templateUrl: './article.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleFacade = inject(ArticleFacade);
  private readonly authFacade = inject(AuthFacade);

  readonly article$ = this.articleFacade.article$;
  readonly comments$ = this.articleFacade.comments$;
  readonly isAuthenticated$ = this.authFacade.isAuthenticated$;
  readonly currentUser$ = this.authFacade.currentUser$;

  readonly isDeleting = signal(false);

  constructor() {
    const slug = this.route.snapshot.params['slug'];
    this.articleFacade.loadArticle(slug);
    this.articleFacade.loadComments(slug);
  }

  canModify(article: Article, currentUser: User | null): boolean {
    return currentUser?.username === article.author.username;
  }

  onToggleFavorite(article: Article): void {
    if (article.favorited) {
      this.articleFacade.unfavoriteArticle(article.slug).subscribe();
    } else {
      this.articleFacade.favoriteArticle(article.slug).subscribe();
    }
  }

  toggleFollowing(_profile: Profile): void {
    // This would be handled by ProfileFacade
  }

  deleteArticle(slug: string): void {
    this.isDeleting.set(true);
    this.articleFacade.deleteArticle(slug).subscribe();
  }

  addComment(slug: string, body: string): void {
    this.articleFacade.addComment(slug, body).subscribe();
  }

  deleteComment(comment: Comment, slug: string): void {
    this.articleFacade.deleteComment(comment.id, slug).subscribe();
  }
}
