import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './unauthorized.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
