import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { AgendaEvent, EventPresenceStatus } from '../../interfaces/agenda.interfaces';

@Component({
  selector: 'agenda-events',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'agenda.component.html',
  styles: [ `
    .limited-description {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-height: 16px; /* fallback */
      max-height: 58px; /* fallback */
      -webkit-line-clamp: 3; /* number of lines to show */
      -webkit-box-orient: vertical;
    }` ]
})
export class AgendaComponent {
  statuses = EventPresenceStatus;
  @Input() events: AgendaEvent[];
  @Output() detailClicked = new EventEmitter<AgendaEvent>();

  constructor(private datePipe: DatePipe) {
  }

  showDetails(event: AgendaEvent) {
    this.detailClicked.emit(event);
  }

  getFormattedDate(date: string) {
    return `${this.datePipe.transform(date, 'mediumDate')} ${this.datePipe.transform(date, 'shortTime')}`;
  }
}
