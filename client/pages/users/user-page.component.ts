import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filterNull } from '../../../../framework/client/ngrx';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { UpdateSecondaryTitleAction } from '../../../../framework/client/sidebar/actions/sidebar.action';
import { SidebarTitle } from '../../../../framework/client/sidebar/interfaces/sidebar.interfaces';
import { Profile } from '../../../../its_you_online_auth/client/interfaces/index';
import { GetTffProfileAction, GetUserAction } from '../../actions/threefold.action';
import { getUser } from '../../tff.state';

@Component({
  selector: 'tff-user-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet></router-outlet>`,
})

export class UserPageComponent implements OnInit, OnDestroy {
  private _userSub: Subscription;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const username = this.route.snapshot.params.username;
    this.store.dispatch(new GetUserAction(username));
    this.store.dispatch(new GetTffProfileAction(username));
    this._userSub = this.store.select(getUser).pipe(filterNull<Profile>()).subscribe((user: Profile) => {
      const name = user.info && user.info.firstname ? `${user.info.firstname} ${user.info.lastname}` : user.username;
      this.store.dispatch(new UpdateSecondaryTitleAction(<SidebarTitle>{ label: name, isTranslation: false }));
    });
  }

  ngOnDestroy() {
    this._userSub.unsubscribe();
  }
}
