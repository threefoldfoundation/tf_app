import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { filterNull, IAppState } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { GetOrderAction, GetUserAction, ResetNodeOrderAction, UpdateOrderAction } from '../../actions';
import { NodeOrder } from '../../interfaces';
import { ApiErrorService } from '../../services';
import { getOrder, getOrderStatus, getUser, updateOrderStatus } from '../../tff.state';

@Component({
  selector: 'tff-order-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tff-order-detail [nodeOrder]="order$ | async"
                      [user]="user$ | async"
                      [status]="orderStatus$ | async"
                      [updateStatus]="updateOrderStatus$ | async"
                      (onUpdate)="onUpdate($event)"></tff-order-detail>`,
})

export class OrderDetailPageComponent implements OnInit, OnDestroy {
  order$: Observable<NodeOrder>;
  user$: Observable<Profile>;
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
    this.order$ = this.store.select(getOrder).pipe(filterNull());
    this.user$ = this.store.select(getUser).pipe(filterNull());
    this.orderStatus$ = this.store.select(getOrderStatus);
    this.updateOrderStatus$ = this.store.select(updateOrderStatus);
    this._errorSub = this.updateOrderStatus$.pipe(filter(status => !status.success && !status.loading && status.error !== null))
      .subscribe(status => this.apiErrorService.showErrorDialog(status.error));
    this._getUserSubscription = this.orderStatus$.pipe(
      filter(s => s.success),
      withLatestFrom(this.order$),
      take(1),
    ).subscribe(([ _, order ]) => this.store.dispatch(new GetUserAction(<string>order.username)));
  }

  ngOnDestroy() {
    this._errorSub.unsubscribe();
    this._getUserSubscription.unsubscribe();
  }

  onUpdate(nodeOrder: NodeOrder) {
    this.store.dispatch(new UpdateOrderAction(nodeOrder));
  }
}
