import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { NodeInfo, TffProfile } from '../../interfaces';

@Component({
  selector: 'tff-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-details.component.html',
})
export class UserDetailsComponent {
  @Input() profile: Profile;
  @Input() tffProfile: TffProfile;

  constructor(private translate: TranslateService,
              private datePipe: DatePipe) {
  }

  getStatusText(node: NodeInfo) {
    const status = this.translate.instant('tff.node_status_' + node.status);
    if (node.status_date) {
      const date = this.datePipe.transform(node.status_date, 'medium');
      return this.translate.instant('tff.status_since_x', { status, date });
    }
    return status;
  }
}
