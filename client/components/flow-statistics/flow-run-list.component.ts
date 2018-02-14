import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FlowRun, FlowRunList, FlowRunStatus } from '../../interfaces';
import { FlowStatisticsService } from '../../services';

@Component({
  selector: 'tff-flow-run-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'flow-run-list.component.html',
})
export class FlowRunListComponent {
  @Input() flowRuns: FlowRunList;
  @Input() showTag = true;
  @Output() loadMore = new EventEmitter<string>();

  constructor(private flowStatisticsService: FlowStatisticsService) {
  }

  trackFlowRuns(index: number, item: FlowRun) {
    return item.id;
  }

  mustShowLastStepDate(flowRun: FlowRun) {
    return flowRun.status === FlowRunStatus.STALLED;
  }

  getFlowName(flowName: string) {
    return this.flowStatisticsService.getFlowName(flowName);
  }
}
