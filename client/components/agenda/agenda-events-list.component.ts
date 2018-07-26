import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { AgendaEvent } from '../../interfaces';

@Component({
  selector: 'tff-agenda-events-list',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'agenda-events-list.component.html',
})

export class AgendaEventsListComponent {
  @Input() events: AgendaEvent[];
  @Input() status: ApiRequestStatus;

  trackById(index: number, item: AgendaEvent) {
    return item.id;
  }
}
