import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { FlowStep, FormFlowStep, WidgetType } from '../../../../rogerthat_api/client/interfaces';
import { FlowRun, FlowRunStatus } from '../../interfaces';
import { FlowStatisticsService } from '../../services';
import { getStepTitle } from '../../util';

@Component({
  selector: 'tff-flow-run-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: 'flow-run-detail.component.html',
  styles: [ `
    .steps {
      width: 300px;
    }

    .step-margin > * {
      margin-bottom: 8px;
    }

    .step-margin {
      margin-top: 8px;
    }` ],
})
export class FlowRunDetailComponent {
  @Input() flowRun: FlowRun;
  @Input() user?: Profile;
  @Input() status: ApiRequestStatus;

  constructor(private flowStatisticsService: FlowStatisticsService) {
  }

  getStepTitle(stepId: string) {
    return getStepTitle(stepId);
  }

  shouldShowNextStep(flowRun: FlowRun) {
    return [ FlowRunStatus.STARTED, FlowRunStatus.IN_PROGRESS, FlowRunStatus.STALLED ].includes(flowRun.status);
  }

  trackSteps(index: number, step: FlowStep) {
    return index;
  }

  getFlowName(flowName: string) {
    return this.flowStatisticsService.getFlowName(flowName);
  }

  isPhotoUpload(step: FormFlowStep) {
    return step.form_type === WidgetType.PHOTO_UPLOAD;
  }

}
