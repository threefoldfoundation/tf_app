import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { SetKYCStatusAction } from '../../actions/threefold.action';
import { SetKYCStatusPayload, TffProfile } from '../../interfaces/profile.interfaces';
import { getTffProfile, getTffProfileStatus, getUser, setKYCStatus } from '../../tff.state';

@Component({
  moduleId: module.id,
  selector: 'kyc-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-kyc [profile]="tffProfile$ | async" [status]="status$ | async" [updateStatus]="updateStatus$ | async"
               (setStatus)="onSetStatus($event)"></tff-kyc>
    </div>`
})

export class KycPageComponent implements OnInit {
  tffProfile$: Observable<TffProfile>;
  status$: Observable<ApiRequestStatus>;
  updateStatus$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.tffProfile$ = this.store.select(getTffProfile).filter(s => s !== null)
      .map(profile => ({
        ...profile, kyc: {
          ...profile.kyc,
          api_calls: profile.kyc.api_calls.concat().reverse(),
          updates: profile.kyc.updates.concat().reverse()
        }
      }));
    this.status$ = this.store.select(getTffProfileStatus);
    this.updateStatus$ = this.store.select(setKYCStatus);
  }

  onSetStatus(setStatusPayload: SetKYCStatusPayload) {
    this.store.select(getUser).first().subscribe(user => this.store.dispatch(new SetKYCStatusAction(user.username, setStatusPayload)));
  }
}
