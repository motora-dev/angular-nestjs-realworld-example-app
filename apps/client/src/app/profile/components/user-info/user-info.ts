import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Profile } from '$domains/profile';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './user-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent {
  readonly profile = input.required<Profile>();
  readonly isCurrentUser = input<boolean>(false);

  readonly toggleFollow = output<void>();

  onToggleFollow(): void {
    this.toggleFollow.emit();
  }
}
