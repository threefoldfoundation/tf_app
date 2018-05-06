import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetUserFlowRunsAction } from '../../actions';
import { FlowRunList } from '../../interfaces';
import { ITffState } from '../../states';
import { getUserFlowRuns, getuserFlowRunsStatus } from '../../tff.state';

@Component({
  selector: 'tff-user-flow-runs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <h2>{{ 'tff.flow_statistics' | translate }}</h2>
    </mat-toolbar>
    <tff-flow-run-list [flowRuns]="flowRuns$ | async" [showTag]="false" (loadMore)="onLoadMore($event)"></tff-flow-run-list>
    <tff-api-request-status [status]="status$ | async"></tff-api-request-status>`,
})
export class UserFlowRunsPageComponent implements OnInit {
  flowRuns$: Observable<FlowRunList>;
  status$: Observable<ApiRequestStatus>;
  username: string;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.username = (<ActivatedRoute>this.route.parent).snapshot.params.username;
    this.flowRuns$ = this.store.select(getUserFlowRuns);
    this.status$ = this.store.select(getuserFlowRunsStatus);
    this.fetchInitialPage();
  }

  onLoadMore(cursor: string) {
    this.store.dispatch(new GetUserFlowRunsAction({ cursor, username: this.username }));
  }

  private fetchInitialPage() {
    // Doesn't do anything in case there was already a page fetched for this user.
    this.flowRuns$.pipe(
      take(1),
      filter(res => res.results.length === 0 || res.results[ 0 ].user !== this.username),
    ).subscribe(() => this.store.dispatch(new GetUserFlowRunsAction({ username: this.username })));
  }
}
