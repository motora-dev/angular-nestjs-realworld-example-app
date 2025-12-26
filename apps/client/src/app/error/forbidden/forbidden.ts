import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './forbidden.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenComponent {}
