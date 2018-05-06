import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filterNull } from '../../../../framework/client';
import { IAppState } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { TffProfile } from '../../interfaces';
import { getTffProfile, getUser, getUserStatus } from '../../tff.state';

@Component({
  selector: 'tff-user-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <h2>{{ 'tff.user_details' | translate }}</h2>
    </mat-toolbar>
    <div class="default-component-padding">
      <tff-user-details [profile]="profile$ | async" [tffProfile]="tffProfile$ | async"></tff-user-details>
    </div>
    <tff-api-request-status [status]="status$ | async"></tff-api-request-status>`,
})
export class UserDetailsPageComponent implements OnInit {
  profile$: Observable<Profile>;
  tffProfile$: Observable<TffProfile>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.profile$ = this.store.select(getUser).pipe(filterNull());
    this.tffProfile$ = this.store.select(getTffProfile).pipe(filterNull());
    this.status$ = this.store.select(getUserStatus);
  }
}
