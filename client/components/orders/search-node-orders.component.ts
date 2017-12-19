import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { NodeOrdersQuery, ORDER_STATUSES } from '../../interfaces';

@Component({
  selector: 'tff-search-node-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'search-node-orders.component.html',
})
export class SearchNodeOrdersComponent implements OnInit, OnDestroy {
  statuses = ORDER_STATUSES;
  @Output() search = new EventEmitter();

  get query() {
    return this._query;
  }

  @Input() set query(value: NodeOrdersQuery) {
    this._query = { ...value };
  }

  private _debouncedQuery = new Subject<NodeOrdersQuery>();
  private _querySub: Subscription;
  private _query: NodeOrdersQuery;

  ngOnInit() {
    this._querySub = this._debouncedQuery.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(query => this.search.emit(query));
  }

  ngOnDestroy() {
    this._querySub.unsubscribe();
  }

  submit(debounced: boolean = true) {
    this.query = { ...this.query, cursor: null };
    if (debounced) {
      this._debouncedQuery.next(this.query);
    } else {
      this.search.emit(this.query);
    }
  }
}
