import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetOrdersAction } from '../../actions';
import { NodeOrderList } from '../../interfaces';
import { ITffState } from '../../states';
import { getOrders, getOrdersStatus } from '../../tff.state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <h2>{{ 'tff.node_orders' | translate }}</h2>
    </mat-toolbar>
    <tff-order-list [orders]="orders$ | async" [status]="status$ | async" linkTarget="_blank"></tff-order-list>`,
})
export class UserNodeOrdersPageComponent implements OnInit {
  orders$: Observable<NodeOrderList>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const username = (<ActivatedRoute>this.route.parent).snapshot.params.username;
    this.store.dispatch(new GetOrdersAction({ query: null, username: username, cursor: null, status: null }));
    this.orders$ = this.store.pipe(select(getOrders));
    this.status$ = this.store.pipe(select(getOrdersStatus));
  }
}
