import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { GetOrderAction, ResetNodeOrderAction, UpdateOrderAction } from '../actions/threefold.action';
import { getOrder, getOrderStatus, updateOrderStatus } from '../tff.state';
import { Observable } from 'rxjs/Observable';
import { NodeOrder } from '../interfaces/nodes.interfaces';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { IAppState } from '../../../framework/client/ngrx/state/app.state';

@Component({
  moduleId: module.id,
  selector: 'order-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <order-detail [nodeOrder]="order$ | async"
                  [status]="orderStatus$ | async"
                  [updateStatus]="updateOrderStatus$ | async"
                  (onUpdate)="onUpdate($event)"></order-detail>`
})

export class OrderDetailPageComponent implements OnInit {
  order$: Observable<NodeOrder>;
  orderStatus$: Observable<ApiRequestStatus>;
  updateOrderStatus$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const orderId = this.route.snapshot.params.orderId;
    this.store.dispatch(new ResetNodeOrderAction());
    this.store.dispatch(new GetOrderAction(orderId));
    this.order$ = this.store.let(getOrder);
    this.orderStatus$ = this.store.let(getOrderStatus);
    this.updateOrderStatus$ = this.store.let(updateOrderStatus);
  }

  onUpdate(nodeOrder: NodeOrder) {
    this.store.dispatch(new UpdateOrderAction(nodeOrder));
  }
}
