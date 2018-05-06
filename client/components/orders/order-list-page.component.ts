import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { first, map, withLatestFrom } from 'rxjs/operators';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetOrdersAction } from '../../actions/threefold.action';
import { NodeOrderList, NodeOrdersQuery } from '../../interfaces/index';
import { getNodeOrdersQuery, getOrders, getOrdersStatus } from '../../tff.state';

@Component({
  selector: 'tff-order-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-search-node-orders [query]="query$ | async" (submitSearch)="onSearch($event)"></tff-search-node-orders>
      <tff-order-list [orders]="orders$ | async"
                      [status]="listStatus$ | async"
                      (loadMore)="onLoadMore()"></tff-order-list>
    </div>
    <div class="fab-bottom-right">
      <a mat-fab [routerLink]="['create']">
        <mat-icon>add</mat-icon>
      </a>
    </div>
  `,
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
    this.orders$ = this.store.select(getOrders).pipe(
      withLatestFrom(this.query$),
      map(([ result, query ]) => ({ ...result, results: result.results.filter(o => query.status ? o.status === query.status : true) })));
    this._sub = this.orders$.pipe(first()).subscribe(result => {
      // Load some orders on initial page load
      if (!result.results.length) {
        this.onSearch({ cursor: null, status: null, query: null });
      }
    });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  onSearch(payload: NodeOrdersQuery) {
    this.store.dispatch(new GetOrdersAction(payload));
  }

  onLoadMore() {
    this.query$.pipe(first()).subscribe(query => this.onSearch(query));
  }
}
