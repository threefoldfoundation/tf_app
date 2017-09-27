import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { GetNodeOrdersPayload, NodeOrderList, NodeOrderStatuses } from '../../interfaces/nodes.interfaces';
import { getOrders, getOrdersStatus } from '../../tff.state';
import { GetOrdersAction } from '../../actions/threefold.action';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-order-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <tff-order-list [orders]="orders$ | async"
                    [listStatus]="listStatus$ | async"
                    (onLoadOrders)="loadOrders($event)"></tff-order-list>`
})
export class OrderListPageComponent implements OnInit {
  orders$: Observable<NodeOrderList>;
  listStatus$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.orders$ = this.store.let(getOrders);
    this.store.dispatch(new GetOrdersAction({ cursor: null, status: NodeOrderStatuses.SIGNED }));
    this.listStatus$ = this.store.let(getOrdersStatus);
  }

  loadOrders(payload: GetNodeOrdersPayload) {
    this.store.dispatch(new GetOrdersAction(payload));
  }
}
