import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseFlowRun, FlowRunStatus, FlowStats } from '../../interfaces';
import { getStepTitle } from '../../util';

@Component({
  selector: 'tff-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: 'dashboard.component.html',
  styleUrls: [ 'dashboard.component.css' ],
})
export class DashboardComponent {
  timeDuration = 86400 * 7;

  @Input() flowStats: FlowStats[];
  @Input() flowRuns: FirebaseFlowRun[];
  FlowRunStatus = FlowRunStatus;

  constructor(private translate: TranslateService,
              private datePipe: DatePipe) {

  }

  nameMapping: { [ key: string ]: string } = {
    'kyc_part_1': 'tff.kyc_procedure',
    'order_node_v4': 'tff.order_node',
    'error_message': 'tff.error_message',
    'buy_tokens_ITO_v3_async_KYC': 'tff.buy_tokens',
    'sign_investment': 'tff.sign_investment',
    'sign_hosting_agreement': 'tff.sign_hosting_agreement',
  };

  getFlowName(flowName: string): string {
    if (flowName in this.nameMapping) {
      return this.translate.instant(this.nameMapping[ flowName ]);
    }
    return flowName;
  }

  getFlowStepText(flowRun: FirebaseFlowRun): string {
    const flowName = this.getFlowName(flowRun.flow_name);
    if (flowRun.status === FlowRunStatus.STARTED) {
      return flowName;
    }
    if (flowRun.status === FlowRunStatus.FINISHED) {
      return flowName;
    }
    if (flowRun.status === FlowRunStatus.IN_PROGRESS) {
      if (flowRun.last_step) {
        return `${flowName}: ${getStepTitle(flowRun.last_step.step_id)} -> Clicked "${getStepTitle(flowRun.last_step.button)}"`;
      }
      return flowName;
    }
    if (flowRun.status === FlowRunStatus.CANCELED) {
      return `${flowName}: Canceled at "${getStepTitle(flowRun.last_step.step_id)}" step`;
    }
    if (flowRun.status === FlowRunStatus.STALLED) {
      if (flowRun.last_step) {
        const time = this.datePipe.transform(flowRun.last_step_date, 'HH:mm');
        return `${flowName}: Stopped at step "${getStepTitle(flowRun.last_step.step_id)}" since ${time}`;
      }
      return flowName;
    }
    return '';
  }

  trackFlowStats(index: number, flowStats: FlowStats) {
    return flowStats.flow_name;
  }

  trackFlowRuns(index: number, flowRun: FirebaseFlowRun) {
    return flowRun.id;
  }
}
