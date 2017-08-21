import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../ngrx/state/app.state';
import { Observable } from 'rxjs/Observable';
import { NodeOrder, NodeOrderListPerStatus, NodeOrderStatuses } from '../interfaces/nodes.interfaces';
import { getOrders, getOrdersStatus } from '../tff.state';
import { GetOrdersAction } from '../actions/threefold.action';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import * as _ from 'lodash';

@Component({
  moduleId: module.id,
  selector: 'tff-order-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tff-order-list [orders]="orders$ | async" (onLoadMore)="loadMore($event)"></tff-order-list>`
})
export class OrderListPageComponent implements OnInit {
  orders$: Observable<NodeOrderListPerStatus>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.orders$ = this.store.let(getOrders).map(result => <NodeOrderListPerStatus>{
      cursor: result.cursor,
      more: result.more,
      results: _.chain(result.results)
        .groupBy<NodeOrderStatuses>(order => order.status)
        .map<NodeOrder[], { type: NodeOrderStatuses, orders: NodeOrder[] }>((value: NodeOrder[], key: string) => ({
          type: parseInt(key),
          orders: value
        }))
        .value()
    });
    this.store.let(getOrders).subscribe(orders => {
      if (!orders.results.length) {
        this.store.dispatch(new GetOrdersAction(null));
      }
    });
    this.status$ = this.store.let(getOrdersStatus);
  }

  loadMore(cursor: string) {
    this.store.dispatch(new GetOrdersAction(cursor));
  }
}
