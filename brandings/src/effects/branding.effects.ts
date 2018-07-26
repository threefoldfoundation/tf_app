import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as actions from '../actions';
import { BrandingActions } from '../actions';
import { IAppState } from '../app/app.state';
import { NodeStatus } from '../interfaces/node-status.interfaces';
import { AgendaService } from '../services/agenda.service';
import { DocumentsService } from '../services/documents.service';
import { GlobalStatsService } from '../services/global-stats.service';
import { NodeService } from '../services/node.service';
import { getUserDataNodeStatus } from '../state/app.state';
import { handleApiError } from '../util/rpc';

@Injectable()
export class BrandingEffects {
  @Effect() getGlobalStats$ = this.actions$.pipe(
    ofType<actions.GetGlobalStatsAction>(actions.BrandingActionTypes.GET_GLOBAL_STATS),
    switchMap(() => this.globalStatsService.listStats().pipe(
      map(stats => new actions.GetGlobalStatsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetGlobalStatsFailedAction, err)))));

  @Effect() getSeeDocuments$ = this.actions$.pipe(
    ofType<actions.GetDocumentsAction>(actions.BrandingActionTypes.GET_DOCUMENTS),
    switchMap(() => this.seeService.list().pipe(
      map(stats => new actions.GetSeeDocumentsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetSeeDocumentsFailedAction, err)))));

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
    switchMap(() => this.store.pipe(
      select(getUserDataNodeStatus),
      map(result => {
        const hasRunningNodes = result.some(node => node.status === NodeStatus.RUNNING);
        if (hasRunningNodes) {
          return new actions.GetNodeStatsAction(result);
        }
        return new actions.GetNodeStatusCompleteAction(result);
      }),
      catchError(err => handleApiError(actions.GetNodeStatusFailedAction, err)))));

  @Effect() updateNodeStatus$ = this.actions$.pipe(
    ofType<actions.GetNodeStatsAction>(actions.BrandingActionTypes.GET_NODE_STATS),
    switchMap(() => this.nodeService.updateNodeStatus().pipe(
      map(result => new actions.GetNodeStatsCompleteAction(result)),
      catchError(err => handleApiError(actions.GetNodeStatsFailedAction, err))),
    ));

  constructor(private actions$: Actions<BrandingActions>,
              private globalStatsService: GlobalStatsService,
              private store: Store<IAppState>,
              private agendaService: AgendaService,
              private seeService: DocumentsService,
              private nodeService: NodeService) {
  }
}
