import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxLet } from '@rx-angular/template/let';
import { take } from 'rxjs';

import { ArticleListConfig } from '$domains/article';
import { HomeFacade } from '$domains/home';
import { Profile, ProfileFacade } from '$domains/profile';
import { AuthFacade } from '$modules/auth';
import { UserInfoComponent } from './components/user-info/user-info';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RxLet, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, UserInfoComponent],
  providers: [ProfileFacade, HomeFacade],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly profileFacade = inject(ProfileFacade);
  private readonly homeFacade = inject(HomeFacade);
  private readonly authFacade = inject(AuthFacade);

  readonly profile$ = this.profileFacade.profile$;
  readonly articles$ = this.homeFacade.articles$;
  readonly currentUser$ = this.authFacade.currentUser$;

  readonly activeTab = signal<'posts' | 'favorites'>('posts');

  private username: string;

  constructor() {
    this.username = this.route.snapshot.params['username'];
    this.profileFacade.loadProfile(this.username);
    this.loadArticles('posts');

    // Check route for favorites
    if (this.route.snapshot.firstChild?.routeConfig?.path === 'favorites') {
      this.activeTab.set('favorites');
      this.loadArticles('favorites');
    }
  }

  isCurrentUser(profile: Profile): boolean {
    let isUser = false;
    this.authFacade.currentUser$.pipe(take(1)).subscribe((user) => {
      isUser = user?.username === profile.username;
    });
    return isUser;
  }

  onToggleFollowing(profile: Profile): void {
    if (profile.following) {
      this.profileFacade.unfollow(profile.username).subscribe();
    } else {
      this.profileFacade.follow(profile.username).subscribe();
    }
  }

  loadArticles(tab: 'posts' | 'favorites'): void {
    this.activeTab.set(tab);
    const config: ArticleListConfig =
      tab === 'posts'
        ? { type: 'all', filters: { author: this.username } }
        : { type: 'all', filters: { favorited: this.username } };
    this.homeFacade.loadArticles(config);
  }
}
