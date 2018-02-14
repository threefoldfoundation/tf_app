import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetFlowRunsAction } from '../../actions';
import { FlowRunList } from '../../interfaces';
import { FlowStatisticsService } from '../../services';
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
              private flowStatisticsService: FlowStatisticsService,
              private store: Store<ITffState>) {
  }

  ngOnInit() {
    this.flowName = this.route.snapshot.params.flowName;
    this.flowRuns$ = this.store.select(getFlowRuns);
    this.status$ = this.store.select(getFlowRunsStatus);
    this.search(null);
  }

  search(cursor: string | null) {
    this.store.dispatch(new GetFlowRunsAction({ cursor, flow_name: this.flowName }));
  }

  getFlowName(flowName: string) {
    return this.flowStatisticsService.getFlowName(flowName);
  }
}
