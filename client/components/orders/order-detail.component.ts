import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NodeOrder, NodeOrderDetail, NodeOrderStatuses, ORDER_STATUSES } from '../../interfaces/nodes.interfaces';
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

export class OrderDetailComponent {
  statuses = NodeOrderStatuses;
  @Input() nodeOrder: NodeOrderDetail;
  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  @Output() onUpdate = new EventEmitter<NodeOrder>();

  constructor(private translate: TranslateService) {
  }

  getOrderStatus(): string {
    return this.translate.instant(ORDER_STATUSES[ this.nodeOrder.status ]);
  }

  canCancel() {
    return [ NodeOrderStatuses.SIGNED, NodeOrderStatuses.APPROVED, NodeOrderStatuses.WAITING_APPROVAL ].includes(this.nodeOrder.status);
  }

  canMarkAsSent() {
    return NodeOrderStatuses.SIGNED === this.nodeOrder.status;
  }

  canApprove() {
    return NodeOrderStatuses.WAITING_APPROVAL === this.nodeOrder.status;
  }

  setOrderStatus(status: NodeOrderStatuses) {
    this.onUpdate.emit(Object.assign({}, this.nodeOrder, { status: status }));
  }
}
