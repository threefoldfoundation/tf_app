import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ApiRequestStatus } from '../../../framework/client/rpc/rpc.interfaces';
import { ApiErrorService } from '../services/api-error.service';

@Component({
  selector: 'tff-api-request-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-progress-spinner mode="indeterminate" *ngIf="status.loading" style="height: 64px;" fxFlex fxLayoutAlign="center"
                         fxLayout="center"></mat-progress-spinner>
    <div *ngIf="status.error && !status.success">
      <p class="error-message" [innerText]="getMessage()"></p>
    </div>`,
})
export class ApiRequestStatusComponent {
  @Input() status: ApiRequestStatus;

  constructor(private apiErrorService: ApiErrorService) {
  }

  getMessage() {
    return this.apiErrorService.getErrorMessage(this.status.error);
  }
}
