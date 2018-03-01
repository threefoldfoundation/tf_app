import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as actions from '../actions/branding.actions';
import { NodeStatus } from '../interfaces/node-status.interfaces';
import { AgendaService } from '../services/agenda.service';
import { GlobalStatsService } from '../services/global-stats.service';
import { NodeService } from '../services/node.service';
import { RogerthatService } from '../services/rogerthat.service';
import { SeeService } from '../services/see.service';
import { WalletService } from '../services/wallet.service';
import { handleApiError, handleError } from '../util/rpc';

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
    .pipe(switchMap(() => this.nodeService.getLocalStatus().pipe(
      map(result => {
        const hasRunningNodes = result.some(node => node.status === NodeStatus.RUNNING);
        if (hasRunningNodes) {
          // User data update will dispatch a GetNodeStatusCompleteAction
          return new actions.UpdateNodeStatusAction(result);
        }
        return new actions.GetNodeStatusCompleteAction(result);
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

  @Effect() getAddress$ = this.actions$.pipe(
    ofType<actions.GetAddresssAction>(actions.BrandingActionTypes.GET_ADDRESS),
    switchMap(action => this.rogerthatService.getAddress(action.payload).pipe(
      map(address => new actions.GetAddresssCompleteAction(address)),
      catchError(err => handleError(actions.GetAddresssFailedAction, err))),
    ));

  @Effect() createSignatureData$ = this.actions$.pipe(
    ofType<actions.CreateSignatureDataAction>(actions.BrandingActionTypes.CREATE_SIGNATURE_DATA),
    switchMap(action => this.walletService.createSignatureData(action.payload).pipe(
      map(result => new actions.CreateSignatureDataCompleteAction(result)),
      catchError(err => handleError(actions.CreateSignatureDataFailedAction, err))),
    ));

  @Effect() createTransaction$: Observable<actions.BrandingActions> = this.actions$.pipe(
    ofType<actions.CreateTransactionAction>(actions.BrandingActionTypes.CREATE_TRANSACTION),
    switchMap(action => this.rogerthatService.createTransactionData(action.payload, action.algorithm, action.keyName,
      action.index, action.message).pipe(
      switchMap(transactionWithSignatures => this.walletService.createTransaction(transactionWithSignatures).pipe(
        map(() => new actions.CreateTransactionCompleteAction()),
        catchError(err => handleError(actions.CreateTransactionFailedAction, err)),
      )),
      catchError(err => handleError(actions.CreateTransactionFailedAction, err))),
    ));

  @Effect() scanQrCode$ = this.actions$.pipe(
    ofType<actions.ScanQrCodeAction>(actions.BrandingActionTypes.SCAN_QR_CODE),
    switchMap(action => this.rogerthatService.startScanningQrCode(action.payload).pipe(
      // Actual result is dispatched in rogerthatService via rogerthat.callbacks.qrCodeScanned
      map(() => new actions.ScanQrCodeStartedAction()),
      catchError(err => handleError(actions.ScanQrCodeFailedAction, err))),
    ));
  constructor(private actions$: Actions,
              private globalStatsService: GlobalStatsService,
              private agendaService: AgendaService,
              private seeService: SeeService,
              private nodeService: NodeService,
              private rogerthatService: RogerthatService,
              private walletService: WalletService) {
  }
}
