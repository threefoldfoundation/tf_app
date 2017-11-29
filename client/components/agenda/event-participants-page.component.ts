import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { GetEventParticipantsAction } from '../../actions/threefold.action';
import { EventParticipant } from '../../interfaces/agenda-events.interfaces';
import { ITffState } from '../../states/tff.state';
import { getEventParticipants, getEventParticipantsStatus } from '../../tff.state';

@Component({
  selector: 'tff-event-participants-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tff-event-participants [participants]="participants$ | async" [status]="status$ | async"></tff-event-participants>`
})
export class EventParticipantsPageComponent implements OnInit {
  participants$: Observable<EventParticipant[]>;
  status$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const eventId = this.route.snapshot.params.eventId;
    // todo: pagination
    this.store.dispatch(new GetEventParticipantsAction({ event_id: eventId, page_size: 1000, cursor: null }));
    this.participants$ = this.store.select(getEventParticipants).map(result => result.results);
    this.status$ = this.store.select(getEventParticipantsStatus);
  }
}
