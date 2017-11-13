import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetAgendaEventsAction } from '../../actions/threefold.action';
import { AgendaEvent } from '../../interfaces/agenda-events.interfaces';
import { ITffState } from '../../states/tff.state';
import { getAgendaEvents, getAgendaEventsStatus } from '../../tff.state';

@Component({
  moduleId: module.id,
  selector: 'tff-agenda-events-list-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tff-agenda-events-list [events]="events$ | async" [status]="status$ | async"></tff-agenda-events-list>
    <div class="fab-bottom-right">
      <a md-fab [routerLink]="['create']">
        <md-icon>add</md-icon>
      </a>
    </div>`
})

export class AgendaEventsListPageComponent implements OnInit {
  events$: Observable<AgendaEvent[]>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>) {
  }

  ngOnInit() {
    this.store.dispatch(new GetAgendaEventsAction());
    this.events$ = this.store.select(getAgendaEvents);
    this.status$ = this.store.select(getAgendaEventsStatus);
  }
}
