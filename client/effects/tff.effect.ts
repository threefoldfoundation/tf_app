import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError } from 'rxjs/operators/catchError';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { map } from 'rxjs/operators/map';
import { switchMap } from 'rxjs/operators/switchMap';
import { withLatestFrom } from 'rxjs/operators/withLatestFrom';
import { IAppState } from '../../../framework/client/ngrx/state/app.state';
import { handleApiError } from '../../../framework/client/rpc/rpc.service';
import * as actions from '../actions/threefold.action';
import { FlowStatisticsService } from '../services';
import { TffService } from '../services/tff.service';
import { getGlobalStatsList } from '../tff.state';

const SEARCH_DEBOUNCE_TIME = 400;

@Injectable()
export class TffEffects {

  @Effect() getNodeOrders$ = this.actions$
    .ofType<actions.GetOrdersAction>(actions.TffActionTypes.GET_ORDERS).pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      switchMap(action => this.tffService.getNodeOrders(action.payload).pipe(
        map(payload => new actions.GetOrdersCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetOrdersFailedAction, err)),
      )));

  @Effect() getNodeOrder$ = this.actions$
    .ofType<actions.GetOrderAction>(actions.TffActionTypes.GET_ORDER).pipe(
      switchMap(action => this.tffService.getNodeOrder(action.payload).pipe(
        map(payload => new actions.GetOrderCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetOrderFailedAction, err)),
      )));

  @Effect() createOrder$ = this.actions$
    .ofType<actions.CreateOrderAction>(actions.TffActionTypes.CREATE_ORDER).pipe(
      switchMap(action => this.tffService.createNodeOrder(action.payload).pipe(
        map(payload => new actions.CreateOrderCompleteAction(payload)),
        catchError(err => handleApiError(actions.CreateOrderFailedAction, err)),
      )));

  @Effect() updateNodeOrdes$ = this.actions$
    .ofType<actions.UpdateOrderAction>(actions.TffActionTypes.UPDATE_ORDER).pipe(
      switchMap(action => this.tffService.updateNodeOrder(action.payload).pipe(
        map(payload => new actions.UpdateOrderCompleteAction(payload)),
        catchError(err => handleApiError(actions.UpdateOrderFailedAction, err)),
      )));

  @Effect() getInvestmentAgreements$ = this.actions$
    .ofType<actions.GetInvestmentAgreementsAction>(actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS).pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      switchMap(action => this.tffService.getInvestmentAgreements(action.payload).pipe(
        map(payload => new actions.GetInvestmentAgreementsCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetInvestmentAgreementsFailedAction, err)),
      )));

  @Effect() getInvestmentAgreement$ = this.actions$
    .ofType<actions.GetInvestmentAgreementAction>(actions.TffActionTypes.GET_INVESTMENT_AGREEMENT).pipe(
      switchMap(action => this.tffService.getInvestmentAgreement(action.payload).pipe(
        map(payload => new actions.GetInvestmentAgreementCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetInvestmentAgreementFailedAction, err)),
      )));

  @Effect() updateInvestmentAgreement$ = this.actions$
    .ofType<actions.UpdateInvestmentAgreementAction>(actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT).pipe(
      switchMap(action => this.tffService.updateInvestmentAgreement(action.payload).pipe(
        map(payload => new actions.UpdateInvestmentAgreementCompleteAction(payload)),
        catchError(err => handleApiError(actions.UpdateInvestmentAgreementFailedAction, err)),
      )));

  @Effect() createInvestmentAgreement$ = this.actions$
    .ofType<actions.CreateInvestmentAgreementAction>(actions.TffActionTypes.CREATE_INVESTMENT_AGREEMENT).pipe(
      switchMap(action => this.tffService.createInvestmentAgreement(action.payload).pipe(
        map(payload => new actions.CreateInvestmentAgreementCompleteAction(payload)),
        catchError(err => handleApiError(actions.CreateInvestmentAgreementFailedAction, err)),
      )));

  @Effect() getGlobalStatsList$ = this.actions$
    .ofType<actions.GetGlobalStatsListAction>(actions.TffActionTypes.GET_GLOBAL_STATS_LIST).pipe(
      withLatestFrom(this.store.select(getGlobalStatsList)),
      switchMap(() => this.tffService.getGlobalStatsList().pipe(
        map(payload => new actions.GetGlobalStatsListCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetGlobalStatsListFailedAction, err)),
      )));

  @Effect() getGlobalStats$ = this.actions$
    .ofType<actions.GetGlobalStatsAction>(actions.TffActionTypes.GET_GLOBAL_STATS).pipe(
      switchMap(action => this.tffService.getGlobalStats(action.payload).pipe(
        map(payload => new actions.GetGlobalStatsCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetGlobalStatsFailedAction, err)),
      )));

  @Effect() updateGlobalStats$ = this.actions$
    .ofType<actions.UpdateGlobalStatsAction>(actions.TffActionTypes.UPDATE_GLOBAL_STATS).pipe(
      switchMap(action => this.tffService.updateGlobalStats(action.payload).pipe(
        map(payload => new actions.UpdateGlobalStatsCompleteAction(payload)),
        catchError(err => handleApiError(actions.UpdateGlobalStatsFailedAction, err)),
      )));

  @Effect() searchUsers$ = this.actions$
    .ofType<actions.SearchUsersAction>(actions.TffActionTypes.SEARCH_USERS).pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      switchMap(action => this.tffService.searchUsers(action.payload).pipe(
        map(payload => new actions.SearchUsersCompleteAction(payload)),
        catchError(err => handleApiError(actions.SearchUsersFailedAction, err)),
      )));

  @Effect() getUser$ = this.actions$
    .ofType<actions.GetUserAction>(actions.TffActionTypes.GET_USER).pipe(
      switchMap(action => this.tffService.getUser(action.payload).pipe(
        map(payload => new actions.GetUserCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetUserFailedAction, err)),
      )));

  @Effect() getTffProfile$ = this.actions$
    .ofType<actions.GetTffProfileAction>(actions.TffActionTypes.GET_TFF_PROFILE).pipe(
      switchMap(action => this.tffService.getTffProfile(action.payload).pipe(
        map(payload => new actions.GetTffProfileCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetTffProfileFailedAction, err)),
      )));

  @Effect() setKYCStatus$ = this.actions$
    .ofType<actions.SetKYCStatusAction>(actions.TffActionTypes.SET_KYC_STATUS).pipe(
      switchMap(action => this.tffService.setKYCStatus(action.username, action.payload).pipe(
        map(payload => new actions.SetKYCStatusCompleteAction(payload)),
        catchError(err => handleApiError(actions.SetKYCStatusFailedAction, err)),
      )));

  @Effect() verifyUtilityBill$ = this.actions$
    .ofType<actions.VerityUtilityBillAction>(actions.TffActionTypes.VERIFY_UTILITY_BILL).pipe(
      switchMap(action => this.tffService.verifyUtilityBill(action.username).pipe(
        map(payload => new actions.VerityUtilityBillCompleteAction(payload)),
        catchError(err => handleApiError(actions.VerityUtilityBillFailedAction, err)),
      )));

  @Effect() getBalance$ = this.actions$
    .ofType<actions.GetBalanceAction>(actions.TffActionTypes.GET_BALANCE).pipe(
      switchMap(action => this.tffService.getBalance(action.payload).pipe(
        map(payload => new actions.GetBalanceCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetBalanceFailedAction, err)),
      )));

  @Effect() getUserTransactions$ = this.actions$
    .ofType<actions.GetUserTransactionsAction>(actions.TffActionTypes.GET_USER_TRANSACTIONS).pipe(
      switchMap(action => this.tffService.getUserTransactions(action.payload).pipe(
        map(payload => new actions.GetUserTransactionsCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetUserTransactionsFailedAction, err)),
      )));

  @Effect() createTransaction$ = this.actions$
    .ofType<actions.CreateTransactionAction>(actions.TffActionTypes.CREATE_TRANSACTION).pipe(
      switchMap(action => this.tffService.createTransaction(action.payload).pipe(
        map(payload => new actions.CreateTransactionCompleteAction(payload)),
        catchError(err => handleApiError(actions.CreateTransactionFailedAction, err)),
      )));

  @Effect() getAgendaEvents$ = this.actions$
    .ofType<actions.GetAgendaEventsAction>(actions.TffActionTypes.GET_AGENDA_EVENTS).pipe(
      switchMap(action => this.tffService.getAgendaEvents(action.payload).pipe(
        map(payload => new actions.GetAgendaEventsCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetAgendaEventsFailedAction, err)),
      )));

  @Effect() getAgendaEvent$ = this.actions$
    .ofType<actions.GetAgendaEventAction>(actions.TffActionTypes.GET_AGENDA_EVENT).pipe(
      switchMap(action => this.tffService.getAgendaEvent(action.payload).pipe(
        map(payload => new actions.GetAgendaEventCompleteAction(payload)),
        catchError(err => handleApiError(actions.GetAgendaEventFailedAction, err)),
      )));

  @Effect() updateAgendaEvent$ = this.actions$
    .ofType<actions.UpdateAgendaEventAction>(actions.TffActionTypes.UPDATE_AGENDA_EVENT).pipe(
      switchMap(action => this.tffService.updateAgendaEvent(action.payload).pipe(
        map(result => new actions.UpdateAgendaEventCompleteAction(result)),
        catchError(err => handleApiError(actions.UpdateAgendaEventFailedAction, err)),
      )));

  @Effect() createAgendaEvent$ = this.actions$
    .ofType<actions.CreateAgendaEventAction>(actions.TffActionTypes.CREATE_AGENDA_EVENT).pipe(
      switchMap(action => this.tffService.createAgendaEvent(action.payload).pipe(
        map(result => new actions.CreateAgendaEventCompleteAction(result)),
        catchError(err => handleApiError(actions.CreateAgendaEventFailedAction, err)),
      )));

  @Effect() getEventPresence$ = this.actions$
    .ofType<actions.GetEventParticipantsAction>(actions.TffActionTypes.GET_EVENT_PARTICIPANTS).pipe(
      switchMap(action => this.tffService.getEventParticipants(action.payload).pipe(
        map(result => new actions.GetEventParticipantsCompleteAction(result)),
        catchError(err => handleApiError(actions.GetEventParticipantsFailedAction, err)),
      )));

  @Effect() getKYCChecks$ = this.actions$
    .ofType<actions.GetKYCChecksAction>(actions.TffActionTypes.GET_KYC_CHECKS).pipe(
      switchMap(action => this.tffService.getKYCChecks(action.payload).pipe(
        map(result => new actions.GetKYCChecksCompleteAction(result)),
        catchError(err => handleApiError(actions.GetKYCChecksFailedAction, err)),
      )));

  @Effect() getUserFlowRuns$ = this.actions$
    .ofType<actions.GetUserFlowRunsAction>(actions.TffActionTypes.GET_USER_FLOW_RUNS).pipe(
      switchMap(action => this.flowStatisticsService.getUserFlowRuns(action.payload).pipe(
        map(result => new actions.GetUserFlowRunsCompleteAction(result)),
        catchError(err => handleApiError(actions.GetUserFlowRunsFailedAction, err)),
      )));

  @Effect() getDistinctFlows$ = this.actions$
    .ofType<actions.GetFlowRunFlowsAction>(actions.TffActionTypes.GET_FLOW_RUN_FLOWS).pipe(
      switchMap(() => this.flowStatisticsService.getDistinctFlows().pipe(
        map(result => new actions.GetFlowRunFlowsCompleteAction(result)),
        catchError(err => handleApiError(actions.GetFlowRunFlowsFailedAction, err)),
      )));

  @Effect() getFlowRuns$ = this.actions$
    .ofType<actions.GetFlowRunsAction>(actions.TffActionTypes.GET_FLOW_RUNS).pipe(
      switchMap(action => this.flowStatisticsService.getFlowRuns(action.payload).pipe(
        map(result => new actions.GetFlowRunsCompleteAction(result)),
        catchError(err => handleApiError(actions.GetFlowRunsFailedAction, err)),
      )));

  @Effect() getFlowRun$ = this.actions$
    .ofType<actions.GetFlowRunAction>(actions.TffActionTypes.GET_FLOW_RUN).pipe(
      switchMap(action => this.flowStatisticsService.getFlowRun(action.payload).pipe(
        map(result => new actions.GetFlowRunCompleteAction(result)),
        catchError(err => handleApiError(actions.GetFlowRunFailedAction, err)),
      )));

  @Effect() getFlowStats$ = this.actions$
    .ofType<actions.GetFlowStatsAction>(actions.TffActionTypes.GET_FLOW_STATS).pipe(
      switchMap(action => this.flowStatisticsService.getFlowStats(action.payload).pipe(
        map(result => new actions.GetFlowStatsCompleteAction(result)),
        catchError(err => handleApiError(actions.GetFlowStatsFailedAction, err)),
      )));

  @Effect() getInstallations$ = this.actions$
    .ofType<actions.GetInstallationsAction>(actions.TffActionTypes.GET_INSTALLATIONS).pipe(
      switchMap(action => this.tffService.getInstallations(action.payload).pipe(
        map(result => new actions.GetInstallationsCompleteAction(result)),
        catchError(err => handleApiError(actions.GetInstallationsFailedAction, err)),
      )));

  @Effect() getInstallation$ = this.actions$
    .ofType<actions.GetInstallationAction>(actions.TffActionTypes.GET_INSTALLATION).pipe(
      switchMap(action => this.tffService.getInstallation(action.payload).pipe(
        map(result => new actions.GetInstallationCompleteAction(result)),
        catchError(err => handleApiError(actions.GetInstallationFailedAction, err)),
      )));

  @Effect() getInstallationLogs$ = this.actions$
    .ofType<actions.GetInstallationLogsAction>(actions.TffActionTypes.GET_INSTALLATION_LOGS).pipe(
      switchMap(action => this.tffService.getInstallationLogs(action.payload).pipe(
        map(result => new actions.GetInstallationLogsCompleteAction(result)),
        catchError(err => handleApiError(actions.GetInstallationLogsFailedAction, err)),
      )));

  @Effect() getNodes$ = this.actions$
    .ofType<actions.GetNodesAction>(actions.TffActionTypes.GET_NODES).pipe(
      switchMap(action => this.tffService.getNodes(action.payload).pipe(
        map(result => new actions.GetNodesCompleteAction(result)),
        catchError(err => handleApiError(actions.GetNodesFailedAction, err)),
      )));

  @Effect() getNode$ = this.actions$
    .ofType<actions.GetNodeAction>(actions.TffActionTypes.GET_NODE).pipe(
      switchMap(action => this.tffService.getNode(action.payload).pipe(
        map(result => new actions.GetNodeCompleteAction(result)),
        catchError(err => handleApiError(actions.GetNodeFailedAction, err)),
      )));

  @Effect() updateNode$ = this.actions$
    .ofType<actions.UpdateNodeAction>(actions.TffActionTypes.UPDATE_NODE).pipe(
      switchMap(action => this.tffService.updateNode(action.id, action.payload).pipe(
        map(result => new actions.UpdateNodeCompleteAction(result)),
        catchError(err => handleApiError(actions.UpdateNodeFailedAction, err)),
      )));

  constructor(private actions$: Actions<actions.TffActions>,
              private tffService: TffService,
              private flowStatisticsService: FlowStatisticsService,
              private store: Store<IAppState>) {
  }
}
