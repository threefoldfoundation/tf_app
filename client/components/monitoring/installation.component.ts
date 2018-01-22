import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Installation, Mobile, MOBILE_TYPES } from '../../../../rogerthat_api/client/interfaces';

@Component({
  selector: 'tff-installation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'installation.component.html',
})
export class InstallationComponent {
  @Input() installation: Installation;
  @Input() status: ApiRequestStatus;

  getMobileType(mobile: Mobile): string {
    return MOBILE_TYPES[ mobile.type ];
  }
}
