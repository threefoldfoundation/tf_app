import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import * as actions from '../actions/branding.actions';
import { IAppState } from '../app/app.state';
import { NodeStatus } from '../interfaces/node-status.interfaces';
import { AgendaService } from '../services/agenda.service';
import { GlobalStatsService } from '../services/global-stats.service';
import { NodeService } from '../services/node.service';
import { ReferrerService } from '../services/referrer.service';
import { SeeService } from '../services/see.service';
import { getNodes } from '../state/app.state';
import { handleApiError } from '../util/rpc';

@Injectable()
export class BrandingEffects {
  @Effect() getGlobalStats$ = this.actions$.pipe(
    ofType<actions.GetGlobalStatsAction>(actions.BrandingActionTypes.GET_GLOBAL_STATS),
    switchMap(() => this.globalStatsService.listStats().pipe(
      map(stats => new actions.GetGlobalStatsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetGlobalStatsFailedAction, err)))));

  @Effect() getSeeDocuments = this.actions$.pipe(
    ofType<actions.GetSeeDocumentsAction>(actions.BrandingActionTypes.GET_SEE_DOCUMENTS),
    switchMap(() => this.seeService.list().pipe(
      map(stats => new actions.GetSeeDocumentsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetSeeDocumentsFailedAction, err)))));

  @Effect() setReferrer$ = this.actions$.pipe(
    ofType<actions.SetReferrerAction>(actions.BrandingActionTypes.SET_REFERRER),
    switchMap(action => this.referrerService.set(action.payload).pipe(
      map(result => new actions.SetReferrerCompleteAction(result)),
      catchError(err => handleApiError(actions.SetReferrerFailedAction, err)))));

  @Effect() getEventPresence$ = this.actions$.pipe(
    ofType<actions.GetEventPresenceAction>(actions.BrandingActionTypes.GET_EVENT_PRESENCE),
    switchMap(action => this.agendaService.getPresence(action.payload).pipe(
      map(result => new actions.GetEventPresenceCompleteAction(result)),
      catchError(err => handleApiError(actions.GetEventPresenceFailedAction, err)))));

  @Effect() updateEventPresence = this.actions$.pipe(
    ofType<actions.UpdateEventPresenceAction>(actions.BrandingActionTypes.UPDATE_EVENT_PRESENCE),
    switchMap(action => this.agendaService.updatePresence(action.payload).pipe(
      map(result => new actions.UpdateEventPresenceCompleteAction(result)),
      catchError(err => handleApiError(actions.UpdateEventPresenceFailedAction, err)))));

  @Effect() getNodeStatus$ = this.actions$.pipe(
    ofType<actions.GetNodeStatusAction>(actions.BrandingActionTypes.GET_NODE_STATUS),
    switchMap(() => this.store.pipe(select(getNodes))),
    // Don't do an api call in case no nodes are online according to userdata
    tap(userdataNodes => {
      if (userdataNodes.every(node => node.status === NodeStatus.HALTED)) {
        this.store.dispatch(new actions.GetNodeStatusCompleteAction(userdataNodes));
      }
    }),
    filter(userDataNodes => userDataNodes.some(node => node.status === NodeStatus.RUNNING)),
    switchMap(() => this.nodeService.getStatus().pipe(
      map(result => new actions.GetNodeStatusCompleteAction(result)),
      catchError(err => handleApiError(actions.GetNodeStatusFailedAction, err)))));

  constructor(private actions$: Actions,
              private store: Store<IAppState>,
              private globalStatsService: GlobalStatsService,
              private referrerService: ReferrerService,
              private agendaService: AgendaService,
              private seeService: SeeService,
              private nodeService: NodeService) {
  }
}
