import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ApiRequestStatus } from '../../../framework/client/rpc/rpc.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-api-request-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-progress-spinner mode="indeterminate" *ngIf="status.loading" style="height: 64px;" fxFlex fxLayoutAlign="center"
                         fxLayout="center"></md-progress-spinner>
    <div *ngIf="status.error && !status.success">
      <p class="error-message" [innerText]="'tff.errors.' + status.error.error | translate : status.error.data"></p>
    </div>`,
})
export class ApiRequestStatusComponent {
  @Input() status: ApiRequestStatus;
}
