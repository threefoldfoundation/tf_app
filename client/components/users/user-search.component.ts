import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { KYCStatuses } from '../../interfaces';
import { SearchUsersQuery } from '../../interfaces/profile.interfaces';

@Component({
  selector: 'tff-user-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-search.component.html',
})
export class UserSearchComponent {
  statuses = KYCStatuses;
  searchString: string;
  @Output() search = new EventEmitter<SearchUsersQuery>();

  get query(): SearchUsersQuery {
    return { ...this._query, query: this.searchString };
  }

  @Input() set query(value: SearchUsersQuery) {
    this._query = { ...value, query: this.searchString || value.query };
    if (!this.searchString) {
      this.searchString = value.query || '';
    }
  }

  private _query: SearchUsersQuery;

  submit() {
    this.query = { ...this.query, cursor: null };
    this.search.next(this.query);
  }
}
