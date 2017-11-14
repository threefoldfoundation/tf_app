import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';

@Component({
  selector: 'api-request-status',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-row justify-content-center *ngIf="status.loading">
      <ion-spinner [style.width]="size" [style.height]="size"></ion-spinner>
    </ion-row>
    <div *ngIf="status.error && !status.success">
      <p class="error-message" [innerText]="status.error?.error"></p>
    </div>`,
})
export class ApiRequestStatusComponent {
  @Input() status: ApiRequestStatus;
  @Input() size: string = '36px';
}
