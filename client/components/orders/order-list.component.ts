import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { NodeOrderList, ORDER_STATUSES } from '../../interfaces/index';

@Component({
  selector: 'tff-order-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'order-list.component.html',
})
export class OrderListComponent {
  statuses = ORDER_STATUSES;
  @Input() orders: NodeOrderList;
  @Input() status: ApiRequestStatus;
  @Input() linkTarget = '_self';
  @Output() loadMore = new EventEmitter();
}
