import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { AgendaEvent } from '../../interfaces/agenda-events.interfaces';

@Component({
  moduleId: module.id,
  selector: 'tff-agenda-events-list',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'agenda-events-list.component.html'
})

export class AgendaEventsListComponent {
  @Input() events: AgendaEvent[];
  @Input() status: ApiRequestStatus;
}
