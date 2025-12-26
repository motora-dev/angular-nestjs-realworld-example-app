import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './unauthorized.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
