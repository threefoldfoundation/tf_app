import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NavController, Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { IAppState } from '../../app/app.state';
import { AgendaEvent, AgendaEventDetail } from '../../interfaces/agenda.interfaces';
import { AgendaService } from '../../services/agenda.service';
import { getEvents } from '../../state/app.state';
import { EventDetailsPageComponent } from './event-details-page.component';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'agenda-page.component.html',
})

export class AgendaPageComponent implements OnInit {
  events$: Observable<AgendaEventDetail[]>;

  constructor(private platform: Platform,
              private store: Store<IAppState>,
              private nav: NavController,
              private agendaService: AgendaService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.events$ = this.store.pipe(select(getEvents), map(events => events.map(event => ({
      ...event,
      is_in_past: new Date() > new Date(event.end_timestamp),
      start_date: this.getDate(event.start_timestamp),
      end_date: this.getDate(event.end_timestamp),
    }))));
  }


  close() {
    this.platform.exitApp();
  }

  onDetailClicked(event: AgendaEvent) {
    this.nav.push(EventDetailsPageComponent, { event });
  }

  private getDate(date: string) {
    return `${this.datePipe.transform(date, 'mediumDate')} ${this.datePipe.transform(date, 'shortTime')}`;
  }
}
