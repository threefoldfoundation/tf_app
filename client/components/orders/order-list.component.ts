import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { NodeOrder, NodeOrderList, ORDER_STATUSES, ORDER_STATUSES_DICT } from '../../interfaces';

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

  getStatus(order: NodeOrder): string {
    return ORDER_STATUSES_DICT[ order.status ];
  }
}
