import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  NODE_ORDER_STATUS_MAPPING,
  NodeOrder,
  NodeOrderDetail,
  NodeOrderStatuses,
  ORDER_STATUSES
} from '../../interfaces/nodes.interfaces';
import { TranslateService } from '@ngx-translate/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';

@Component({
  moduleId: module.id,
  selector: 'order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'order-detail.component.html',
  styles: [ `.order-content {
    padding: 16px;
  }` ]
})

export class OrderDetailComponent implements OnChanges {
  statuses = NodeOrderStatuses;
  allowedStatuses: NodeOrderStatuses[] = [];
  @Input() nodeOrder: NodeOrderDetail;
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
    return this.translate.instant(ORDER_STATUSES.find(s => s.value === this.nodeOrder.status).label);
  }

  setOrderStatus(status: NodeOrderStatuses) {
    let order = { ...this.nodeOrder };
    delete order.see_document;
    this.onUpdate.emit({ ...<NodeOrder>order, status: status });
  }
}
