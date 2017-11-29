import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KYCStatus, KYCStatuses, KYCStatusUpdate } from '../../interfaces/profile.interfaces';

@Component({
  selector: 'tff-kyc-updates',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'kyc-updates.component.html',
  styles: [ `.mat-card.kyc-card {
    width: 350px;
    margin: 16px 0;
  }` ]
})

export class KycUpdatesComponent {
  @Input() updates: KYCStatusUpdate[];

  private statuses: { [key: number]: string } = KYCStatuses.reduce((acc, current) => ({ ...acc, [ current.value ]: current.label }), {});

  getStatusString(status: KYCStatus) {
    return this.statuses[ status ];
  }
}
