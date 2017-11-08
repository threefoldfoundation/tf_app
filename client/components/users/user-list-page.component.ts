import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../../../framework/client/ngrx';
import { SearchUsersAction } from '../../actions/index';
import { SearchUsersQuery, UserList } from '../../interfaces/profile.interfaces';
import { getUserList, getUserQueryList } from '../../tff.state';

@Component({
  moduleId: module.id,
  selector: 'user-list-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <user-list [userList]="userList$ | async" [query]="query$ | async" (onQuery)="onQuery($event)"></user-list>
    </div>`
})

export class UserListPageComponent implements OnInit {
  userList$: Observable<UserList>;
  query$: Observable<SearchUsersQuery>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.onQuery({ cursor: null, query: null, kyc_status: null });
    this.userList$ = this.store.select(getUserList);
    this.query$ = this.store.select(getUserQueryList);
  }

  onQuery(query: SearchUsersQuery) {
    this.store.dispatch(new SearchUsersAction(query));
  }
}
