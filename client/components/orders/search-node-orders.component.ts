import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NodeOrdersQuery, ORDER_STATUSES } from '../../interfaces';

@Component({
  selector: 'tff-search-node-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'search-node-orders.component.html',
})
export class SearchNodeOrdersComponent {
  statuses = ORDER_STATUSES;
  searchString: string | null;
  @Output() search = new EventEmitter();

  get query() {
    return { ...this._query, query: this.searchString };
  }

  @Input() set query(value: NodeOrdersQuery) {
    this._query = { ...value, query: this.searchString || value.query };
    if (!this.searchString) {
      this.searchString = value.query;
    }
  }

  private _query: NodeOrdersQuery;

  submit() {
    this.query = { ...this.query, cursor: null };
    this.search.emit(this.query);
  }
}
