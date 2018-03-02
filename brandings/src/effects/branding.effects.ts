import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs/observable/of';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import * as actions from '../actions';
import { CreateTransactionDataCompleteAction, CreateTransactionDataFailedAction } from '../actions';
import { IAppState } from '../app/app.state';
import { NodeStatus } from '../interfaces/node-status.interfaces';
import { AgendaService } from '../services/agenda.service';
import { GlobalStatsService } from '../services/global-stats.service';
import { NodeService } from '../services/node.service';
import { SeeService } from '../services/see.service';
import { WalletService } from '../services/wallet.service';
import { getUserDataNodeStatus } from '../state/app.state';
import { handleApiError, handleError } from '../util/rpc';

@Injectable()
export class BrandingEffects {
  @Effect() getGlobalStats$ = this.actions$
    .ofType<actions.GetGlobalStatsAction>(actions.BrandingActionTypes.GET_GLOBAL_STATS)
    .pipe(switchMap(() => this.globalStatsService.listStats().pipe(
      map(stats => new actions.GetGlobalStatsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetGlobalStatsFailedAction, err)))));

  @Effect() getSeeDocuments$ = this.actions$
    .ofType<actions.GetSeeDocumentsAction>(actions.BrandingActionTypes.GET_SEE_DOCUMENTS)
    .pipe(switchMap(() => this.seeService.list().pipe(
      map(stats => new actions.GetSeeDocumentsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetSeeDocumentsFailedAction, err)))));

  @Effect() getEventPresence$ = this.actions$
    .ofType<actions.GetEventPresenceAction>(actions.BrandingActionTypes.GET_EVENT_PRESENCE)
    .pipe(switchMap(action => this.agendaService.getPresence(action.payload).pipe(
      map(result => new actions.GetEventPresenceCompleteAction(result)),
      catchError(err => handleApiError(actions.GetEventPresenceFailedAction, err)))));

  @Effect() updateEventPresence = this.actions$
    .ofType<actions.UpdateEventPresenceAction>(actions.BrandingActionTypes.UPDATE_EVENT_PRESENCE)
    .pipe(switchMap(action => this.agendaService.updatePresence(action.payload).pipe(
      map(result => new actions.UpdateEventPresenceCompleteAction(result)),
      catchError(err => handleApiError(actions.UpdateEventPresenceFailedAction, err)))));

  @Effect() getNodeStatus$ = this.actions$
    .ofType<actions.GetNodeStatusAction>(actions.BrandingActionTypes.GET_NODE_STATUS)
    .pipe(switchMap(() => this.store.pipe(
      select(getUserDataNodeStatus),
      first(),
      map(result => {
        const hasRunningNodes = result.some(node => node.status === NodeStatus.RUNNING);
        if (hasRunningNodes) {
          return new actions.UpdateNodeStatusAction();
        }
        return new actions.GetNodeStatusCompleteAction();
      }),
      catchError(err => handleApiError(actions.GetNodeStatusFailedAction, err)))));

  @Effect() updateNodeStatus$ = this.actions$.pipe(
    ofType<actions.UpdateNodeStatusAction>(actions.BrandingActionTypes.UPDATE_NODE_STATUS),
    switchMap(() => this.nodeService.updateNodeStatus().pipe(
      map(() => new actions.UpdateNodeStatusCompleteAction()),
      catchError(err => handleApiError(actions.UpdateNodeStatusFailedAction, err))),
    ));

  @Effect() getTransactions = this.actions$.pipe(
    ofType<actions.GetTransactionsAction>(actions.BrandingActionTypes.GET_TRANSACTIONS),
    switchMap(action => this.walletService.getTransactions(action.address).pipe(
      map(transactions => new actions.GetTransactionsCompleteAction(transactions)),
      catchError(err => handleError(actions.GetTransactionsFailedAction, err))),
    ));

  @Effect() createSignatureData$ = this.actions$.pipe(
    ofType<actions.CreateSignatureDataAction>(actions.BrandingActionTypes.CREATE_SIGNATURE_DATA),
    switchMap(action => this.walletService.createSignatureData(action.payload).pipe(
      map(result => new actions.CreateSignatureDataCompleteAction(result)),
      catchError(err => handleError(actions.CreateSignatureDataFailedAction, err))),
    ));

  @Effect() createTransactionDataSuccess$ = this.actions$.pipe(
    ofType<CreateTransactionDataCompleteAction>(actions.RogerthatActionTypes.CREATE_TRANSACTION_DATA_COMPLETE),
    switchMap(action => this.walletService.createTransaction(action.payload).pipe(
      map(() => new actions.CreateTransactionCompleteAction()),
      catchError(err => handleError(actions.CreateTransactionFailedAction, err))),
    ));

  @Effect() createTransactionDataFailed$ = this.actions$.pipe(
    ofType<CreateTransactionDataFailedAction>(actions.RogerthatActionTypes.CREATE_TRANSACTION_DATA_FAILED),
    switchMap(action => of(new actions.CreateTransactionFailedAction(action.payload))),
  );

  constructor(private actions$: Actions,
              private globalStatsService: GlobalStatsService,
              private store: Store<IAppState>,
              private agendaService: AgendaService,
              private seeService: SeeService,
              private nodeService: NodeService,
              private walletService: WalletService) {
  }
}
