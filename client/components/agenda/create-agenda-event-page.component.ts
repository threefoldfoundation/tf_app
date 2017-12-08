import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { withLatestFrom } from 'rxjs/operators/withLatestFrom';
import { ApiRequestStatus, apiRequestSuccess } from '../../../../framework/client/rpc/rpc.interfaces';
import { CreateAgendaEventAction, ResetAgendaEventAction } from '../../actions/threefold.action';
import { AgendaEvent, AgendaEventType } from '../../interfaces/agenda-events.interfaces';
import { ITffState } from '../../states/tff.state';
import { createAgendaEventStatus, getAgendaEvent } from '../../tff.state';

@Component({
  selector: 'tff-create-agenda-event-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-agenda-event-detail [event]="event" [status]="status" [updateStatus]="createStatus$ | async"
                               (submitted)="onSubmitted($event)"></tff-agenda-event-detail>
    </div>`
})

export class CreateAgendaEventPageComponent implements OnInit {
  createStatus$: Observable<ApiRequestStatus>;
  event: Partial<AgendaEvent>;
  status = apiRequestSuccess;

  constructor(private store: Store<ITffState>,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const now = new Date().toISOString();
    this.event = {
      description: '',
      location: '',
      type: AgendaEventType.EVENT,
      start_timestamp: now,
      end_timestamp: now,
    };
    this.store.dispatch(new ResetAgendaEventAction());
    this.createStatus$ = this.store.select(createAgendaEventStatus);
    this.createStatus$.filter(status => status.success).pipe(withLatestFrom(this.store.select(getAgendaEvent)))
      .subscribe(([ status, event ]: [ ApiRequestStatus, AgendaEvent ]) => {
        return this.router.navigate([ '..', event.id ], { relativeTo: this.route });
      });
  }

  onSubmitted(event: AgendaEvent) {
    this.store.dispatch(new CreateAgendaEventAction({ ...event }));
  }
}
