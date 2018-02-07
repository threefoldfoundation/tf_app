import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { ORDER_STATUSES_DICT } from '../../interfaces';
import { NODE_ORDER_STATUS_MAPPING, NodeOrder, NodeOrderStatuses } from '../../interfaces';

@Component({
  selector: 'tff-order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'order-detail.component.html',
  styles: [ `.order-content {
    padding: 16px;
  }` ]
})

export class OrderDetailComponent implements OnChanges {
  statuses = NodeOrderStatuses;
  ORDER_STATUSES_DICT = ORDER_STATUSES_DICT;
  allowedStatuses: NodeOrderStatuses[] = [];
  @Input() nodeOrder: NodeOrder;
  @Input() user: Profile | null;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Output() onUpdate = new EventEmitter<NodeOrder>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nodeOrder && changes.nodeOrder.currentValue) {
      this.allowedStatuses = NODE_ORDER_STATUS_MAPPING[ (<NodeOrder>changes.nodeOrder.currentValue).status ];
    }
  }

  setOrderStatus(status: NodeOrderStatuses) {
    this.onUpdate.emit({ ...this.nodeOrder, status: status });
  }
}
