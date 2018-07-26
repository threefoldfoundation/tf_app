import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filterNull } from '../../../../framework/client';
import { IAppState } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { TffProfile } from '../../interfaces';
import { getTffProfile, getTffProfileStatus } from '../../tff.state';

@Component({
  selector: 'tff-user-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <h2>{{ 'tff.user_details' | translate }}</h2>
    </mat-toolbar>
    <div class="default-component-padding">
      <tff-user-details [tffProfile]="profile" *ngIf="tffProfile$ | async as profile"></tff-user-details>
    </div>
    <tff-api-request-status [status]="status$ | async"></tff-api-request-status>`,
})
export class UserDetailsPageComponent implements OnInit {
  tffProfile$: Observable<TffProfile>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.tffProfile$ = this.store.pipe(select(getTffProfile), (filterNull()));
    this.status$ = this.store.pipe(select(getTffProfileStatus));
  }
}
