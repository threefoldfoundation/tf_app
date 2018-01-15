import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FLOW_RUN_STATUSES_MAPPING, FlowRunStatus } from '../../interfaces';

@Component({
  selector: 'tff-flow-run-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [color]="colors[status]" selected="true">
        {{ FLOW_RUN_STATUSES_MAPPING[status] | translate }}
      </mat-chip>
    </mat-chip-list>`,
})
export class FlowRunStatusComponent {
  @Input() status: FlowRunStatus;
  FLOW_RUN_STATUSES_MAPPING = FLOW_RUN_STATUSES_MAPPING;

  colors = {
    [ FlowRunStatus.STARTED ]: 'accent',
    [ FlowRunStatus.IN_PROGRESS ]: 'accent',
    [ FlowRunStatus.STALLED ]: 'warn',
    [ FlowRunStatus.CANCELED ]: 'primary',
    [ FlowRunStatus.FINISHED ]: 'primary',
  };

}
