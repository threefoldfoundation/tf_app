import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../framework/client/ngrx/state/app.state';
import { handleApiError } from '../../../framework/client/rpc/rpc.service';
import * as actions from '../actions/threefold.action';
import { TffService } from '../services/tff.service';
import { getGlobalStatsList } from '../tff.state';

@Injectable()
export class TffEffects {

  @Effect() getNodeOrders$ = this.actions$
    .ofType<actions.GetOrdersAction>(actions.TffActionTypes.GET_ORDERS)
    .switchMap(action => this.tffService.getNodeOrders(action.payload)
      .map(payload => new actions.GetOrdersCompleteAction(payload))
      .catch(err => handleApiError(actions.GetOrdersFailedAction, err)));

  @Effect() getNodeOrder$ = this.actions$
    .ofType<actions.GetOrderAction>(actions.TffActionTypes.GET_ORDER)
    .switchMap(action => this.tffService.getNodeOrder(action.payload)
      .map(payload => new actions.GetOrderCompleteAction(payload))
      .catch(err => handleApiError(actions.GetOrderFailedAction, err)));

  @Effect() updateNodeOrdes$ = this.actions$
    .ofType<actions.UpdateOrderAction>(actions.TffActionTypes.UPDATE_ORDER)
    .switchMap(action => this.tffService.updateNodeOrder(action.payload)
      .map(payload => new actions.UpdateOrderCompleteAction(payload))
      .catch(err => handleApiError(actions.UpdateOrderFailedAction, err)));

  @Effect() getInvestmentAgreements$ = this.actions$
    .ofType<actions.GetInvestmentAgreementsAction>(actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS)
    .switchMap(action => this.tffService.getInvestmentAgreements(action.payload)
      .map(payload => new actions.GetInvestmentAgreementsCompleteAction(payload))
      .catch(err => handleApiError(actions.GetInvestmentAgreementsFailedAction, err)));

  @Effect() getInvestmentAgreement$ = this.actions$
    .ofType<actions.GetInvestmentAgreementAction>(actions.TffActionTypes.GET_INVESTMENT_AGREEMENT)
    .switchMap(action => this.tffService.getInvestmentAgreement(action.payload)
      .map(payload => new actions.GetInvestmentAgreementCompleteAction(payload))
      .catch(err => handleApiError(actions.GetInvestmentAgreementFailedAction, err)));

  @Effect() updateInvestmentAgreement$ = this.actions$
    .ofType<actions.UpdateInvestmentAgreementAction>(actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT)
    .switchMap(action => this.tffService.updateInvestmentAgreement(action.payload)
      .map(payload => new actions.UpdateInvestmentAgreementCompleteAction(payload))
      .catch(err => handleApiError(actions.UpdateInvestmentAgreementFailedAction, err)));

  @Effect() getGlobalStatsList$ = this.actions$
    .ofType<actions.GetGlobalStatsListAction>(actions.TffActionTypes.GET_GLOBAL_STATS_LIST)
    .withLatestFrom(this.store.select(getGlobalStatsList))
    .switchMap(() => this.tffService.getGlobalStatsList()
      .map(payload => new actions.GetGlobalStatsListCompleteAction(payload))
      .catch(err => handleApiError(actions.GetGlobalStatsListFailedAction, err)));

  @Effect() getGlobalStats$ = this.actions$
    .ofType<actions.GetGlobalStatsAction>(actions.TffActionTypes.GET_GLOBAL_STATS)
    .switchMap(action => this.tffService.getGlobalStats(action.payload)
      .map(payload => new actions.GetGlobalStatsCompleteAction(payload))
      .catch(err => handleApiError(actions.GetGlobalStatsFailedAction, err)));

  @Effect() updateGlobalStats$ = this.actions$
    .ofType<actions.UpdateGlobalStatsAction>(actions.TffActionTypes.UPDATE_GLOBAL_STATS)
    .switchMap(action => this.tffService.updateGlobalStats(action.payload)
      .map(payload => new actions.UpdateGlobalStatsCompleteAction(payload))
      .catch(err => handleApiError(actions.UpdateGlobalStatsFailedAction, err)));

  @Effect() searchUsers$ = this.actions$
    .ofType<actions.SearchUsersAction>(actions.TffActionTypes.SEARCH_USERS)
    .switchMap(action => this.tffService.searchUsers(action.payload)
      .map(payload => new actions.SearchUsersCompleteAction(payload))
      .catch(err => handleApiError(actions.SearchUsersFailedAction, err)));

  @Effect() getUser$ = this.actions$
    .ofType<actions.GetUserAction>(actions.TffActionTypes.GET_USER)
    .switchMap(action => this.tffService.getUser(action.payload)
      .map(payload => new actions.GetUserCompleteAction(payload))
      .catch(err => handleApiError(actions.GetUserFailedAction, err)));

  @Effect() getTffProfile$ = this.actions$
    .ofType<actions.GetTffProfileAction>(actions.TffActionTypes.GET_TFF_PROFILE)
    .switchMap(action => this.tffService.getTffProfile(action.payload)
      .map(payload => new actions.GetTffProfileCompleteAction(payload))
      .catch(err => handleApiError(actions.GetTffProfileFailedAction, err)));

  @Effect() setKYCStatus$ = this.actions$
    .ofType<actions.SetKYCStatusAction>(actions.TffActionTypes.SET_KYC_STATUS)
    .switchMap(action => this.tffService.setKYCStatus(action.username, action.payload)
      .map(payload => new actions.SetKYCStatusCompleteAction(payload))
      .catch(err => handleApiError(actions.SetKYCStatusFailedAction, err)));

  @Effect() getBalance$ = this.actions$
    .ofType<actions.GetBalanceAction>(actions.TffActionTypes.GET_BALANCE)
    .switchMap(action => this.tffService.getBalance(action.payload)
      .map(payload => new actions.GetBalanceCompleteAction(payload))
      .catch(err => handleApiError(actions.GetBalanceFailedAction, err)));

  @Effect() getUserTransactions$ = this.actions$
    .ofType<actions.GetUserTransactionsAction>(actions.TffActionTypes.GET_USER_TRANSACTIONS)
    .switchMap(action => this.tffService.getUserTransactions(action.payload)
      .map(payload => new actions.GetUserTransactionsCompleteAction(payload))
      .catch(err => handleApiError(actions.GetUserTransactionsFailedAction, err)));

  @Effect() createTransaction$ = this.actions$
    .ofType<actions.CreateTransactionAction>(actions.TffActionTypes.CREATE_TRANSACTION)
    .switchMap(action => this.tffService.createTransaction(action.payload)
      .map(payload => new actions.CreateTransactionCompleteAction(payload))
      .catch(err => handleApiError(actions.CreateTransactionFailedAction, err)));

  @Effect() getAgendaEvents$ = this.actions$
    .ofType<actions.GetAgendaEventsAction>(actions.TffActionTypes.GET_AGENDA_EVENTS)
    .switchMap(() => this.tffService.getAgendaEvents()
      .map(payload => new actions.GetAgendaEventsCompleteAction(payload))
      .catch(err => handleApiError(actions.GetAgendaEventsFailedAction, err)));

  @Effect() getAgendaEvent$ = this.actions$
    .ofType<actions.GetAgendaEventAction>(actions.TffActionTypes.GET_AGENDA_EVENT)
    .switchMap(action => this.tffService.getAgendaEvent(action.payload)
      .map(payload => new actions.GetAgendaEventCompleteAction(payload))
      .catch(err => handleApiError(actions.GetAgendaEventFailedAction, err)));

  @Effect() updateAgendaEvent$ = this.actions$
    .ofType<actions.UpdateAgendaEventAction>(actions.TffActionTypes.UPDATE_AGENDA_EVENT)
    .switchMap(action => this.tffService.updateAgendaEvent(action.payload)
      .map(result => new actions.UpdateAgendaEventCompleteAction(result))
      .catch(err => handleApiError(actions.UpdateAgendaEventFailedAction, err)));

  @Effect() createAgendaEvent$ = this.actions$
    .ofType<actions.CreateAgendaEventAction>(actions.TffActionTypes.CREATE_AGENDA_EVENT)
    .switchMap(action => this.tffService.createAgendaEvent(action.payload)
      .map(result => new actions.CreateAgendaEventCompleteAction(result))
      .catch(err => handleApiError(actions.CreateAgendaEventFailedAction, err)));

  @Effect() getEventPresence$ = this.actions$
    .ofType<actions.GetEventParticipantsAction>(actions.TffActionTypes.GET_EVENT_PARTICIPANTS)
    .switchMap(action => this.tffService.getEventParticipants(action.payload)
      .map(result => new actions.GetEventParticipantsCompleteAction(result))
      .catch(err => handleApiError(actions.GetEventParticipantsFailedAction, err)));

  constructor(private actions$: Actions<actions.TffActions>,
              private tffService: TffService,
              private store: Store<IAppState>) {
  }
}
