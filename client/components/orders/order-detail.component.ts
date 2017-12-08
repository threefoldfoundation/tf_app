import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { NODE_ORDER_STATUS_MAPPING, NodeOrder, NodeOrderStatuses, ORDER_STATUSES } from '../../interfaces/nodes.interfaces';

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
  allowedStatuses: NodeOrderStatuses[] = [];
  @Input() nodeOrder: NodeOrder;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Output() onUpdate = new EventEmitter<NodeOrder>();

  constructor(private translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nodeOrder && changes.nodeOrder.currentValue) {
      this.allowedStatuses = NODE_ORDER_STATUS_MAPPING[ (<NodeOrder>changes.nodeOrder.currentValue).status ];
    }
  }

  getOrderStatus(): string {
    const status = ORDER_STATUSES.find(s => s.value === this.nodeOrder.status);
    return status ? this.translate.instant(status.label) : '';
  }

  setOrderStatus(status: NodeOrderStatuses) {
    this.onUpdate.emit({ ...this.nodeOrder, status: status });
  }
}
