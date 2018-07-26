import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filterNull, IAppState } from '../../../../framework/client/ngrx';
import { UpdateSecondaryTitleAction } from '../../../../framework/client/sidebar/actions';
import { SidebarTitle } from '../../../../framework/client/sidebar/interfaces';
import { GetTffProfileAction } from '../../actions';
import { getTffProfile } from '../../tff.state';

@Component({
  selector: 'tff-user-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet></router-outlet>`,
})

export class UserPageComponent implements OnInit, OnDestroy {
  private _profileSubscription: Subscription;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const username = this.route.snapshot.params.username;
    this.store.dispatch(new GetTffProfileAction(username));
    this._profileSubscription = this.store.pipe(select(getTffProfile), filterNull()).subscribe(profile => {
      const item = <SidebarTitle>{ label: profile.info.name, isTranslation: false, imageUrl: profile.info.avatar_url };
      this.store.dispatch(new UpdateSecondaryTitleAction(item));
    });
  }

  ngOnDestroy() {
    this._profileSubscription.unsubscribe();
  }
}
