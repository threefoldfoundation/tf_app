import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import * as actions from '../actions/branding.actions';
import { AgendaService } from '../services/agenda.service';
import { GlobalStatsService } from '../services/global-stats.service';
import { ReferrerService } from '../services/referrer.service';
import { SeeService } from '../services/see.service';
import { handleApiError } from '../util/rpc';

@Injectable()
export class BrandingEffects {
  @Effect() getGlobalStats$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetGlobalStatsAction>(actions.BrandingActionTypes.GET_GLOBAL_STATS)
    .switchMap(() => this.globalStatsService.listStats()
      .map(stats => new actions.GetGlobalStatsCompleteAction(stats))
      .catch(err => handleApiError(actions.GetGlobalStatsFailedAction, err)));

  @Effect() getSeeDocuments$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetSeeDocumentsAction>(actions.BrandingActionTypes.GET_SEE_DOCUMENTS)
    .switchMap(() => this.seeService.list()
      .map(stats => new actions.GetSeeDocumentsCompleteAction(stats))
      .catch(err => handleApiError(actions.GetSeeDocumentsFailedAction, err)));

  @Effect() setReferrer$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.SetReferrerAction>(actions.BrandingActionTypes.SET_REFERRER)
    .switchMap(action => this.referrerService.set(action.payload)
      .map(result => new actions.SetReferrerCompleteAction(result))
      .catch(err => handleApiError(actions.SetReferrerFailedAction, err)));

  @Effect() getEvents$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetEventsAction>(actions.BrandingActionTypes.GET_EVENTS)
    .switchMap(() => this.agendaService.getEvents()
      .map(result => new actions.GetEventsCompleteAction(result)));

  @Effect() getEventPresence$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetEventPresenceAction>(actions.BrandingActionTypes.GET_EVENT_PRESENCE)
    .switchMap(action => this.agendaService.getPresence(action.payload)
      .map(result => new actions.GetEventPresenceCompleteAction(result))
      .catch(err => handleApiError(actions.GetEventPresenceFailedAction, err)));

  @Effect() updateEventPresence: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.UpdateEventPresenceAction>(actions.BrandingActionTypes.UPDATE_EVENT_PRESENCE)
    .switchMap(action => this.agendaService.updatePresence(action.payload)
      .map(result => new actions.UpdateEventPresenceCompleteAction(result))
      .catch(err => handleApiError(actions.UpdateEventPresenceFailedAction, err)));

  constructor(private actions$: Actions,
              private globalStatsService: GlobalStatsService,
              private referrerService: ReferrerService,
              private agendaService: AgendaService,
              private seeService: SeeService) {
  }
}
