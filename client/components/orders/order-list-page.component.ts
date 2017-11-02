import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetOrdersAction } from '../../actions/threefold.action';
import { NodeOrderList, NodeOrdersQuery } from '../../interfaces/index';
import { getNodeOrdersQuery, getOrders, getOrdersStatus } from '../../tff.state';

@Component({
  moduleId: module.id,
  selector: 'tff-order-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <tff-order-list [orders]="orders$ | async"
                    [listStatus]="listStatus$ | async"
                    [query]="query$ | async"
                    (onQuery)="loadOrders($event)"></tff-order-list>`
})
export class OrderListPageComponent implements OnInit, OnDestroy {
  orders$: Observable<NodeOrderList>;
  listStatus$: Observable<ApiRequestStatus>;
  query$: Observable<NodeOrdersQuery>;

  private _sub: Subscription;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.listStatus$ = this.store.select(getOrdersStatus);
    this.query$ = this.store.select(getNodeOrdersQuery);
    this.orders$ = this.store.select(getOrders).withLatestFrom(this.query$)
      .map(([ result, query ]) => ({ ...result, results: result.results.filter(o => query.status ? o.status === query.status : true) }));
    this._sub = this.orders$.first().subscribe(result => {
      // Load some orders on initial page load
      if (!result.results.length) {
        this.loadOrders({ cursor: null, status: null, query: null });
      }
    });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  loadOrders(payload: NodeOrdersQuery) {
    this.store.dispatch(new GetOrdersAction(payload));
  }
}
