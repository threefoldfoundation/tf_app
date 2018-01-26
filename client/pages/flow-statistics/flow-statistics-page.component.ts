import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetFlowRunsAction } from '../../actions';
import { FlowRun, FlowRunList, FlowRunStatus } from '../../interfaces';
import { ITffState } from '../../states';
import { getFlowRuns, getFlowRunsStatus } from '../../tff.state';

@Component({
  selector: 'tff-flow-statistics-page-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'flow-statistics-page.component.html',
})
export class FlowStatisticsPageComponent implements OnInit {
  flowRuns$: Observable<FlowRunList>;
  status$: Observable<ApiRequestStatus>;
  flowName: string;

  constructor(private route: ActivatedRoute,
              private store: Store<ITffState>) {
  }

  ngOnInit() {
    this.flowName = this.route.snapshot.params.flowName;
    this.flowRuns$ = this.store.select(getFlowRuns);
    this.status$ = this.store.select(getFlowRunsStatus);
    this.search(null);
  }

  trackFlowRuns(index: number, item: FlowRun) {
    return item.id;
  }

  mustShowLastStepDate(flowRun: FlowRun) {
    return flowRun.status === FlowRunStatus.STALLED;
  }

  search(cursor: string | null) {
    this.store.dispatch(new GetFlowRunsAction({ cursor, flow_name: this.flowName }));
  }
}
