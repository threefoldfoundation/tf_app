import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { GetNodeOrdersPayload, NodeOrderList, NodeOrderStatuses } from '../../interfaces/nodes.interfaces';
import { getNodeOrdersType, getOrders, getOrdersStatus } from '../../tff.state';
import { GetOrdersAction } from '../../actions/threefold.action';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'tff-order-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <tff-order-list [orders]="orders$ | async"
                    [listStatus]="listStatus$ | async"
                    [status]="listType$ | async"
                    (onLoadOrders)="loadOrders($event)"></tff-order-list>`
})
export class OrderListPageComponent implements OnInit, OnDestroy {
  orders$: Observable<NodeOrderList>;
  listStatus$: Observable<ApiRequestStatus>;
  listType$: Observable<NodeOrderStatuses>;

  private _sub: Subscription;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.orders$ = this.store.let(getOrders);
    this.listStatus$ = this.store.let(getOrdersStatus);
    this._sub = this.orders$.first().subscribe(result => {
      if (!result.results.length) {
        this.store.dispatch(new GetOrdersAction({ cursor: null, status: NodeOrderStatuses.SIGNED }));
      }
    });
    this.listType$ = this.store.let(getNodeOrdersType);
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  loadOrders(payload: GetNodeOrdersPayload) {
    this.store.dispatch(new GetOrdersAction(payload));
  }
}
