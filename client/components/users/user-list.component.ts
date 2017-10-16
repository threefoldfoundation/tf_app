import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Profile, SearchUsersQuery, UserList } from '../../../../its_you_online_auth/client/interfaces/user.interfaces';

@Component({
  moduleId: module.id,
  selector: 'user-list',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-list.component.html'
})

export class UserListComponent implements OnInit, OnDestroy {
  @Input() userList: UserList;
  @Output() onQuery = new EventEmitter<SearchUsersQuery>();
  private _debouncedQuery = new Subject<SearchUsersQuery>();
  private _querySub: Subscription;

  private _query: SearchUsersQuery;

  get query(): SearchUsersQuery {
    return this._query;
  }

  @Input() set query(value: SearchUsersQuery) {
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

  getUserName(user: Profile) {
    return user.info && user.info.firstname ? `${user.info.firstname} ${user.info.lastname}` : user.username;
  }

  submit() {
    this.query = { ...this.query, cursor: null };
    this._debouncedQuery.next(this.query);
  }

  loadMore() {
    // Don't delay
    this.onQuery.emit(this.query);
  }
}
