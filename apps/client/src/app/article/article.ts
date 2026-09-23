import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
  imports: [AsyncPipe, RouterLink, MarkdownPipe, ArticleMetaComponent, ArticleCommentComponent, CommentFormComponent],
  providers: [ArticleFacade],
  templateUrl: './article.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly articleFacade = inject(ArticleFacade);
  private readonly authFacade = inject(AuthFacade);

  readonly article = toSignal(this.articleFacade.article$);
  readonly comments = toSignal(this.articleFacade.comments$);
  readonly isAuthenticated = toSignal(this.authFacade.isAuthenticated$);
  readonly currentUser = toSignal(this.authFacade.currentUser$);

  readonly isDeleting = signal(false);

  constructor() {
    const slug = this.route.snapshot.params['slug'];
    this.articleFacade.loadArticle(slug);
    this.articleFacade.loadComments(slug);
  }

  canModify(article: Article, currentUser: User | null | undefined): boolean {
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
