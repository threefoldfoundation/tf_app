import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { Profile } from '../../../../its_you_online_auth/client/interfaces/user.interfaces';
import { getUser } from '../../tff.state';

@Component({
  selector: 'user-details-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
  template: `
    <div class="default-component-padding">
      <p>Sorry, haven't gotten the chance yet to create a nice page</p>
      <pre>{{ user$ | async | json }}</pre>
    </div>`
})
export class UserDetailsPageComponent implements OnInit {
  user$: Observable<Profile>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.user$ = this.store.select(getUser);
  }
}
