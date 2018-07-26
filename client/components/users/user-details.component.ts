import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TffProfile } from '../../interfaces';

@Component({
  selector: 'tff-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-details.component.html',
})
export class UserDetailsComponent {
  @Input() tffProfile: TffProfile;
}
