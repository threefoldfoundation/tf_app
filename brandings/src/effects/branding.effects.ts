import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as actions from '../actions';
import {
  BrandingActions,
  CreateTransactionDataCompleteAction,
  CreateTransactionDataFailedAction,
  GetBlockAction,
  GetLatestBlockAction,
} from '../actions';
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
  @Effect() getGlobalStats$ = this.actions$.pipe(
    ofType<actions.GetGlobalStatsAction>(actions.BrandingActionTypes.GET_GLOBAL_STATS),
    switchMap(() => this.globalStatsService.listStats().pipe(
      map(stats => new actions.GetGlobalStatsCompleteAction(stats)),
      catchError(err => handleApiError(actions.GetGlobalStatsFailedAction, err)))));

  @Effect() getSeeDocuments$ = this.actions$.pipe(
    ofType<actions.GetSeeDocumentsAction>(actions.BrandingActionTypes.GET_SEE_DOCUMENTS),
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
      map(result => new actions.CreateTransactionCompleteAction(result)),
      catchError(err => handleError(actions.CreateTransactionFailedAction, err))),
    ));

  @Effect() createTransactionDataFailed$ = this.actions$.pipe(
    ofType<CreateTransactionDataFailedAction>(actions.RogerthatActionTypes.CREATE_TRANSACTION_DATA_FAILED),
    switchMap(action => of(new actions.CreateTransactionFailedAction(action.payload))),
  );

  @Effect() getLatestBlock$ = this.actions$.pipe(
    ofType<GetLatestBlockAction>(actions.BrandingActionTypes.GET_LATEST_BLOCK),
    switchMap(action => this.walletService.getLatestBlock().pipe(
      map(result => new actions.GetLatestBlockCompleteAction(result)),
      catchError(err => handleError(actions.GetLatestBlockFailedAction, err))),
    ));

  @Effect() getBlock$ = this.actions$.pipe(
    ofType<GetBlockAction>(actions.BrandingActionTypes.GET_BLOCK),
    switchMap(action => this.walletService.getBlock(action.height).pipe(
      map(result => new actions.GetBlockCompleteAction(result)),
      catchError(err => handleError(actions.GetBlockFailedAction, err))),
    ));

  constructor(private actions$: Actions<BrandingActions>,
              private globalStatsService: GlobalStatsService,
              private store: Store<IAppState>,
              private agendaService: AgendaService,
              private seeService: SeeService,
              private nodeService: NodeService,
              private walletService: WalletService) {
  }
}
