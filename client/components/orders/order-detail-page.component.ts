import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { filterNull, IAppState } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetOrderAction, GetTffProfileAction, ResetNodeOrderAction, UpdateOrderAction } from '../../actions';
import { NodeOrder, TffProfile } from '../../interfaces';
import { ApiErrorService } from '../../services';
import { getOrder, getOrderStatus, getTffProfile, updateOrderStatus } from '../../tff.state';

@Component({
  selector: 'tff-order-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tff-order-detail [nodeOrder]="order$ | async"
                      [profile]="profile$ | async"
                      [status]="orderStatus$ | async"
                      [updateStatus]="updateOrderStatus$ | async"
                      (onUpdate)="onUpdate($event)"></tff-order-detail>`,
})

export class OrderDetailPageComponent implements OnInit, OnDestroy {
  order$: Observable<NodeOrder>;
  profile$: Observable<TffProfile>;
  orderStatus$: Observable<ApiRequestStatus>;
  updateOrderStatus$: Observable<ApiRequestStatus>;

  private _errorSub: Subscription;
  private _getUserSubscription: Subscription;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute,
              private apiErrorService: ApiErrorService) {
  }

  ngOnInit() {
    const orderId = this.route.snapshot.params.orderId;
    this.store.dispatch(new ResetNodeOrderAction());
    this.store.dispatch(new GetOrderAction(orderId));
    this.order$ = this.store.pipe(select(getOrder), filterNull());
    this.profile$ = this.store.pipe(select(getTffProfile), filterNull());
    this.orderStatus$ = this.store.pipe(select(getOrderStatus));
    this.updateOrderStatus$ = this.store.pipe(select(updateOrderStatus));
    this._errorSub = this.updateOrderStatus$.pipe(filter(status => !status.success && !status.loading && status.error !== null))
      .subscribe(status => this.apiErrorService.showErrorDialog(status.error));
    this._getUserSubscription = this.orderStatus$.pipe(
      filter(s => s.success),
      withLatestFrom(this.order$),
      take(1),
    ).subscribe(([ _, order ]) => this.store.dispatch(new GetTffProfileAction(<string>order.username)));
  }

  ngOnDestroy() {
    this._errorSub.unsubscribe();
    this._getUserSubscription.unsubscribe();
  }

  onUpdate(nodeOrder: NodeOrder) {
    this.store.dispatch(new UpdateOrderAction(nodeOrder));
  }
}
