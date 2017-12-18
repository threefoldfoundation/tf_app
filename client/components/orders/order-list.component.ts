import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { NodeOrderList, NodeOrdersQuery, NodeOrderStatuses, ORDER_STATUSES } from '../../interfaces/index';

@Component({
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
    this._querySub = this._debouncedQuery.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => this.onQuery.emit(query));
  }

  ngOnDestroy() {
    this._querySub.unsubscribe();
  }

  submit(debounced: boolean = true) {
    this.query = { ...this.query, cursor: null };
    if (debounced) {
    this._debouncedQuery.next(this.query);
    } else {
      this.onQuery.emit(this.query);
    }
  }

  loadMore() {
    this.onQuery.emit(this.query);
  }
}
