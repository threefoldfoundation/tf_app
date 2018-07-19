import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TffProfile } from '../../interfaces';

@Component({
  selector: 'tff-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-card.component.html',
})
export class UserCardComponent {
  @Input() profile: TffProfile;
}
