import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { TffProfile } from '../../interfaces';

@Component({
  selector: 'tff-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-details.component.html',
})
export class UserDetailsComponent {
  @Input() profile: Profile;
  @Input() tffProfile: TffProfile;
}
