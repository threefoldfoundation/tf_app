import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetFlowRunFlowsAction } from '../../actions';
import { FlowStatisticsService } from '../../services';
import { ITffState } from '../../states';
import { getDistinctFlows, getDistinctFlowsStatus } from '../../tff.state';

@Component({
  selector: 'tff-flow-statistics-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-api-request-status [status]="status$ | async"></tff-api-request-status>
      <mat-nav-list>
        <a mat-list-item [routerLink]="flow" *ngFor="let flow of distinctFlows$ | async">{{ getFlowName(flow) }}</a>
      </mat-nav-list>
    </div>`,
})
export class FlowStatisticsOverviewPageComponent implements OnInit {
  distinctFlows$: Observable<string[]>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>,
              private flowStatisticsService: FlowStatisticsService) {
  }

  ngOnInit() {
    this.store.dispatch(new GetFlowRunFlowsAction());
    this.distinctFlows$ = this.store.select(getDistinctFlows);
    this.status$ = this.store.select(getDistinctFlowsStatus);
  }

  getFlowName(flowName: string) {
    return this.flowStatisticsService.getFlowName(flowName);
  }
}
