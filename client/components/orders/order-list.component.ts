import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NodeOrderList, NodeOrdersQuery, NodeOrderStatuses, ORDER_STATUSES } from '../../interfaces/index';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'tff-order-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'order-list.component.html',
  styles: [ `.orders-content {
    padding: 16px;
  }
  ` ]
})
export class OrderListComponent implements OnInit, OnDestroy {
  statuses = ORDER_STATUSES;
  @Input() orders: NodeOrderList;
  @Input() listStatus: ApiRequestStatus;
  @Input() status: NodeOrderStatuses;
  @Output() onQuery = new EventEmitter<NodeOrdersQuery>();
  private _debouncedQuery = new Subject<NodeOrdersQuery>();
  private _querySub: Subscription;

  private _query: NodeOrdersQuery;

  get query() {
    return this._query;
  }

  @Input() set query(value: NodeOrdersQuery) {
    this._query = { ...value };
  }

  ngOnInit() {
    this._querySub = this._debouncedQuery
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(query => this.onQuery.emit(query));
  }

  ngOnDestroy() {
    this._querySub.unsubscribe();
  }

  submitImmediately() {
    this.onQuery.emit(this.query);
  }

  submit() {
    this._debouncedQuery.next(this.query);
  }
}
