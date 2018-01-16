import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { INSTALLATION_STATUSES, InstallationStatus } from '../../../../rogerthat_api/client/interfaces';

@Component({
  selector: 'tff-installation-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [color]="colors[status]" selected="true">
        {{ INSTALLATION_STATUSES[status] | translate }}
      </mat-chip>
    </mat-chip-list>`,
})
export class InstallationStatusComponent {
  @Input() status: InstallationStatus;
  INSTALLATION_STATUSES = INSTALLATION_STATUSES;

  colors = {
    [ InstallationStatus.STARTED ]: 'accent',
    [ InstallationStatus.IN_PROGRESS ]: 'warn',
    [ InstallationStatus.FINISHED ]: 'primary',
  };
}
