import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client';
import { filterNull } from '../../../../framework/client/ngrx';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { GetFlowRunAction } from '../../actions';
import { FlowRun } from '../../interfaces';
import { ITffState } from '../../states';
import { getFlowRun, getFlowRunStatus, getUser } from '../../tff.state';

@Component({
  selector: 'tff-user-flow-runs-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <button mat-icon-button [routerLink]="['..']">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h2>{{ 'tff.flow_statistics' | translate }}</h2>
    </mat-toolbar>
    <div class="default-component-padding">
      <tff-flow-run-detail [flowRun]="flowRun$ | async" [user]="user$ | async" [status]="status$ | async"></tff-flow-run-detail>
    </div>`,
})
export class UserFlowRunsDetailsPageComponent implements OnInit {
  flowRun$: Observable<FlowRun>;
  status$: Observable<ApiRequestStatus>;
  user$: Observable<Profile>;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const flowRunId = this.route.snapshot.params.flowRunId;
    this.store.dispatch(new GetFlowRunAction(flowRunId));
    this.flowRun$ = this.store.select(getFlowRun).pipe(filterNull());
    this.status$ = this.store.select(getFlowRunStatus);
    this.user$ = this.store.select(getUser).pipe(filterNull());
  }
}
