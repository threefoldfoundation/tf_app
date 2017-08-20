import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { NodeOrder, NodeOrderStatuses } from '../interfaces/nodes.interfaces';
import { TranslateService } from '@ngx-translate/core';
import { getOrders } from '../tff.state';
import { GetOrdersAction } from '../actions/threefold.action';
import { IAppState } from '../../../framework/client/ngrx/state/app.state';

@Component({
  moduleId: module.id,
  selector: 'order-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'order-list.component.html'
})
export class OrderListComponent implements OnInit {
  orders$: Observable<NodeOrder[]>;
  STATUSES = {
    [NodeOrderStatuses.CANCELED]: 'tff.canceled',
    [NodeOrderStatuses.CREATED]: 'tff.created',
    [NodeOrderStatuses.SIGNED]: 'tff.signed',
    [NodeOrderStatuses.SENT]: 'tff.sent',
    [NodeOrderStatuses.ARRIVED]: 'tff.arrived',
  };

  constructor(private store: Store<IAppState>,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.store.dispatch(new GetOrdersAction());
    this.orders$ = this.store.let(getOrders);
  }

  getStatusString(order: NodeOrder): string {
    return this.translate.instant(this.STATUSES[ order.status ]);
  }
}
