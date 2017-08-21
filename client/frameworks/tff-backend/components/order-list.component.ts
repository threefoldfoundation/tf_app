import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IAppState } from '../../ngrx/state/app.state';
import { ApiRequestStatus, ORDER_STATUSES } from '../interfaces/index';
import { NodeOrderListPerStatus, NodeOrderStatuses } from '../interfaces/nodes.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-order-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'order-list.component.html',
  styles: [ `.orders-content {
    padding: 16px;
  }` ]
})
export class OrderListComponent {
  @Input() orders: NodeOrderListPerStatus;
  @Input() status: ApiRequestStatus;
  @Output() onLoadMore = new EventEmitter<string>();

  getStatusString(status: NodeOrderStatuses): string {
    return ORDER_STATUSES[ status ];
  }
}
