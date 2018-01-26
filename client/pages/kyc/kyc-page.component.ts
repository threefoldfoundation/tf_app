import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { take } from 'rxjs/operators/take';
import { Subscription } from 'rxjs/Subscription';
import { filterNull } from '../../../../framework/client/ngrx';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetKYCChecksAction, SetKYCStatusAction } from '../../actions/threefold.action';
import { Check } from '../../interfaces/onfido.interfaces';
import { SetKYCStatusPayload, TffProfile } from '../../interfaces/profile.interfaces';
import { getKYCChecks, getKYCChecksStatus, getTffProfile, getTffProfileStatus, setKYCStatus } from '../../tff.state';

@Component({
  selector: 'tff-kyc-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <h2>{{ 'tff.kyc' | translate }}</h2>
    </mat-toolbar>
    <div class="default-component-padding">
      <tff-kyc [profile]="tffProfile$ | async"
               [status]="status$ | async"
               [updateStatus]="updateStatus$ | async"
               [checks]="checks$ | async"
               [checksStatus]="checksStatus$ | async"
               (setStatus)="onSetStatus($event)"></tff-kyc>
    </div>`
})

export class KycPageComponent implements OnInit, OnDestroy {
  tffProfile$: Observable<TffProfile>;
  status$: Observable<ApiRequestStatus>;
  updateStatus$: Observable<ApiRequestStatus>;
  checks$: Observable<Check[]>;
  checksStatus$: Observable<ApiRequestStatus>;

  private _sub: Subscription;
  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.tffProfile$ = this.store.select(getTffProfile).pipe(
      filterNull<TffProfile>(),
      map(profile => ({
        ...profile, kyc: {
          ...profile.kyc,
          updates: profile.kyc.updates.concat().reverse()
        }
      })));
    this.status$ = this.store.select(getTffProfileStatus);
    this.updateStatus$ = this.store.select(setKYCStatus);
    this.checks$ = this.store.select(getKYCChecks);
    this.checksStatus$ = this.store.select(getKYCChecksStatus);
    this._sub = this.tffProfile$.subscribe(user => {
      this.store.dispatch(new GetKYCChecksAction(user.username));
    });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  onSetStatus(setStatusPayload: SetKYCStatusPayload) {
    this.tffProfile$.pipe(take(1)).subscribe(profile => this.store.dispatch(new SetKYCStatusAction(profile.username, setStatusPayload)));
  }
}
