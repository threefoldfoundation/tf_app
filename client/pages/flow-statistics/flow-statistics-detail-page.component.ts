import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/operators/combineLatest';
import { filter } from 'rxjs/operators/filter';
import { map } from 'rxjs/operators/map';
import { take } from 'rxjs/operators/take';
import { Subscription } from 'rxjs/Subscription';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { GetFlowRunAction, GetUserAction } from '../../actions';
import { FlowRun } from '../../interfaces';
import { ITffState } from '../../states';
import { getFlowRun, getFlowRunStatus, getUser, getUserStatus } from '../../tff.state';

@Component({
  selector: 'tff-flow-statistics-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <button mat-button [routerLink]="['..']">
        <mat-icon>arrow_back</mat-icon>
        {{ 'tff.back' | translate }}
      </button>
      <tff-api-request-status [status]="status$ | async"></tff-api-request-status>
      <tff-flow-run-detail [flowRun]="flowRun$ | async" [user]="user$ | async" *ngIf="(status$ | async)?.success"></tff-flow-run-detail>
    </div>`,
})
export class FlowStatisticsDetailPageComponent implements OnInit, OnDestroy {
  flowRun$: Observable<FlowRun>;
  user$: Observable<Profile>;
  status$: Observable<ApiRequestStatus>;
  flowId: string;

  private _flowRunSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private store: Store<ITffState>) {
  }

  ngOnInit() {
    this.flowId = this.route.snapshot.params.flowId;
    this.flowRun$ = <Observable<FlowRun>>this.store.select(getFlowRun).pipe(filter(f => f !== null));
    this.status$ = this.store.select(getFlowRunStatus).pipe(
      combineLatest(this.store.select(getUserStatus)),
      map(([ s1, s2 ]) => ({ success: s1.success && s2.success, loading: s1.loading || s2.loading, error: s1.error || s2.error })),
    );
    this.user$ = <Observable<Profile>>this.store.select(getUser).pipe(filter(p => p !== null));
    this.getFlowRun();
    this._flowRunSubscription = this.flowRun$.pipe(take(1)).subscribe(f => this.store.dispatch(new GetUserAction(f.user)));
  }

  ngOnDestroy() {
    this._flowRunSubscription.unsubscribe();
  }

  getFlowRun() {
    this.store.dispatch(new GetFlowRunAction(this.flowId));
  }
}
