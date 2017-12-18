import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { first } from 'rxjs/operators/first';
import { IAppState } from '../../../../framework/client/ngrx';
import { SearchUsersAction } from '../../actions';
import { SearchUsersQuery, UserList } from '../../interfaces';
import { getUserList, getUserQueryList } from '../../tff.state';

@Component({
  selector: 'tff-user-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-user-search [query]="query$ | async" (search)="onQuery($event)"></tff-user-search>
      <tff-user-list [userList]="userList$ | async" (loadMore)="onLoadMore()"></tff-user-list>
    </div>`
})
export class UserListPageComponent implements OnInit {
  userList$: Observable<UserList>;
  query$: Observable<SearchUsersQuery>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.userList$ = this.store.select(getUserList);
    this.query$ = this.store.select(getUserQueryList);
    this.onLoadMore();
  }

  onQuery(query: SearchUsersQuery) {
    this.store.dispatch(new SearchUsersAction(query));
  }

  onLoadMore() {
    this.query$.pipe(first()).subscribe(query => this.onQuery(query));
  }
}
