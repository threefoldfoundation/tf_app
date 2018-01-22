import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { InstallationLog } from '../../../../rogerthat_api/client/interfaces';

@Component({
  selector: 'tff-installation-logs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'installation-logs.component.html',
})
export class InstallationLogsComponent {
  @Input() logs: InstallationLog[];
  @Input() status: ApiRequestStatus;
}
