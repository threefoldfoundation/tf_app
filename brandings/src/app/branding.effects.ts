import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { switchMap } from 'rxjs/operators/switchMap';
import * as actions from '../actions/branding.actions';
import { AgendaService } from '../services/agenda.service';
import { GlobalStatsService } from '../services/global-stats.service';
import { NodeService } from '../services/node.service';
import { SeeService } from '../services/see.service';
import { handleApiError } from '../util/rpc';

@Injectable()
export class BrandingEffects {
  @Effect() getGlobalStats$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetGlobalStatsAction>(actions.BrandingActionTypes.GET_GLOBAL_STATS)
    .pipe(switchMap(() => this.globalStatsService.listStats().pipe(
      map(stats => new actions.GetGlobalStatsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetGlobalStatsFailedAction, err)))));

  @Effect() getSeeDocuments$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetSeeDocumentsAction>(actions.BrandingActionTypes.GET_SEE_DOCUMENTS)
    .pipe(switchMap(() => this.seeService.list().pipe(
      map(stats => new actions.GetSeeDocumentsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetSeeDocumentsFailedAction, err)))));

  @Effect() getEvents$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetEventsAction>(actions.BrandingActionTypes.GET_EVENTS)
    .pipe(switchMap(() => this.agendaService.getEvents()
      .pipe(map(result => new actions.GetEventsCompleteAction(result)))));

  @Effect() getEventPresence$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetEventPresenceAction>(actions.BrandingActionTypes.GET_EVENT_PRESENCE)
    .pipe(switchMap(action => this.agendaService.getPresence(action.payload).pipe(
      map(result => new actions.GetEventPresenceCompleteAction(result)),
      catchError(err => handleApiError(actions.GetEventPresenceFailedAction, err)))));

  @Effect() updateEventPresence: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.UpdateEventPresenceAction>(actions.BrandingActionTypes.UPDATE_EVENT_PRESENCE)
    .pipe(switchMap(action => this.agendaService.updatePresence(action.payload).pipe(
      map(result => new actions.UpdateEventPresenceCompleteAction(result)),
      catchError(err => handleApiError(actions.UpdateEventPresenceFailedAction, err)))));

  @Effect() getNodeStatus$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetNodeStatusAction>(actions.BrandingActionTypes.GET_NODE_STATUS)
    .pipe(switchMap(() => this.nodeService.getStatus().pipe(
      map(result => new actions.GetNodeStatusCompleteAction(result)),
      catchError(err => handleApiError(actions.GetNodeStatusFailedAction, err)))));

  constructor(private actions$: Actions,
              private globalStatsService: GlobalStatsService,
              private agendaService: AgendaService,
              private seeService: SeeService,
              private nodeService: NodeService) {
  }
}
