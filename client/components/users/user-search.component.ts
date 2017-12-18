import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { KYCStatuses } from '../../interfaces';
import { SearchUsersQuery } from '../../interfaces/profile.interfaces';

@Component({
  selector: 'tff-user-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-search.component.html',
})
export class UserSearchComponent implements OnInit, OnDestroy {
  statuses = KYCStatuses;
  @Output() search = new EventEmitter<SearchUsersQuery>();

  get query(): SearchUsersQuery {
    return this._query;
  }

  @Input() set query(value: SearchUsersQuery) {
    this._query = { ...value };
  }

  private _debouncedQuery = new Subject<SearchUsersQuery>();
  private _querySub: Subscription;
  private _query: SearchUsersQuery;

  ngOnInit() {
    this._querySub = this._debouncedQuery.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(query => this.search.emit(query));
  }

  ngOnDestroy() {
    this._querySub.unsubscribe();
  }

  submit() {
    this.query = { ...this.query, cursor: null };
    this._debouncedQuery.next(this.query);
  }
}
