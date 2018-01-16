import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Installation, MOBILE_TYPES } from '../../../../rogerthat_api/client/interfaces';
import { InstallationsList } from '../../../../rogerthat_api/client/interfaces/app';
import { GetInstallationsQuery } from '../../interfaces';

@Component({
  selector: 'tff-installations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: 'installations.component.html',
  styles: [ `tff-installation-status {
    margin-right: 16px;
  }` ],
})
export class InstallationsComponent {
  @Input() installations: InstallationsList;
  @Input() status: ApiRequestStatus;
  @Output() loadMore = new EventEmitter<GetInstallationsQuery>();

  getMobileType(installation: Installation): string {
    return MOBILE_TYPES[ installation.platform ];
  }

  trackById(index: number, item: Installation) {
    return item.id;
  }
}
