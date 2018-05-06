import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetAgendaEventsAction } from '../../actions';
import { AgendaEvent } from '../../interfaces';
import { ITffState } from '../../states';
import { getAgendaEvents, getAgendaEventsStatus } from '../../tff.state';

@Component({
  selector: 'tff-agenda-events-list-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-tab-group (selectedTabChange)="loadEvents($event)">
      <mat-tab [label]="tab.label | translate" *ngFor="let tab of tabs">
        <tff-agenda-events-list [events]="events$ | async" [status]="status$ | async"></tff-agenda-events-list>
      </mat-tab>
    </mat-tab-group>
    <div class="fab-bottom-right">
      <a mat-fab [routerLink]="['create']">
        <mat-icon>add</mat-icon>
      </a>
    </div>`,
})

export class AgendaEventsListPageComponent implements OnInit {
  events$: Observable<AgendaEvent[]>;
  status$: Observable<ApiRequestStatus>;
  tabs = [ {
    label: 'tff.upcoming',
    past: false,
  }, {
    label: 'tff.past',
    past: true,
  } ];

  constructor(private store: Store<ITffState>) {
  }

  loadEvents(tabChange: MatTabChangeEvent) {
    this.store.dispatch(new GetAgendaEventsAction(this.tabs[ tabChange.index ].past));
  }

  ngOnInit() {
    this.store.dispatch(new GetAgendaEventsAction(false));
    this.events$ = this.store.select(getAgendaEvents);
    this.status$ = this.store.select(getAgendaEventsStatus);
  }
}
