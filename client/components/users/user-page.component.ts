import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { UpdateSecondaryTitleAction } from '../../../../framework/client/sidebar/actions/sidebar.action';
import { SidebarTitle } from '../../../../framework/client/sidebar/interfaces/sidebar.interfaces';
import { GetUserAction } from '../../actions/threefold.action';
import { getUser } from '../../tff.state';

@Component({
  moduleId: module.id,
  selector: 'user-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet></router-outlet>`
})

export class UserPageComponent implements OnInit, OnDestroy {
  private _userSub: Subscription;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.store.dispatch(new GetUserAction(this.route.snapshot.params.username));
    this._userSub = this.store.select(getUser).filter(u => u !== null).subscribe(user => {
      const name = user.info && user.info.firstname ? `${user.info.firstname} ${user.info.lastname}` : user.username;
      this.store.dispatch(new UpdateSecondaryTitleAction(<SidebarTitle>{ label: name, isTranslation: false }));
    });
  }

  ngOnDestroy() {
    this._userSub.unsubscribe();
  }
}
