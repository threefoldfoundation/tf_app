import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { handleApiError } from '../../../framework/client/rpc/rpc.service';
import * as actions from '../actions/threefold.action';
import { TffService } from '../services/tff.service';
import { getGlobalStatsList } from '../tff.state';
import { IAppState } from '../../../framework/client/ngrx/state/app.state';

@Injectable()
export class TffEffects {

  @Effect() getNodeOrders$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_ORDERS)
    .switchMap(action => this.tffService.getNodeOrders(action.payload)
      .map(payload => new actions.GetOrdersCompleteAction(payload))
      .catch(err => handleApiError(actions.GetOrdersFailedAction, err)));

  @Effect() getNodeOrdes$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_ORDER)
    .switchMap(action => this.tffService.getNodeOrder(action.payload)
      .map(payload => new actions.GetOrderCompleteAction(payload))
      .catch(err => handleApiError(actions.GetOrderFailedAction, err)));

  @Effect() updateNodeOrdes$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.UPDATE_ORDER)
    .switchMap(action => this.tffService.updateNodeOrder(action.payload)
      .map(payload => new actions.UpdateOrderCompleteAction(payload))
      .catch(err => handleApiError(actions.UpdateOrderFailedAction, err)));

  @Effect() getInvestmentAgreements$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS)
    .switchMap(action => this.tffService.getInvestmentAgreements(action.payload)
      .map(payload => new actions.GetInvestmentAgreementsCompleteAction(payload))
      .catch(err => handleApiError(actions.GetInvestmentAgreementsFailedAction, err)));

  @Effect() getInvestmentAgreement$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_INVESTMENT_AGREEMENT)
    .switchMap(action => this.tffService.getInvestmentAgreement(action.payload)
      .map(payload => new actions.GetInvestmentAgreementCompleteAction(payload))
      .catch(err => handleApiError(actions.GetInvestmentAgreementFailedAction, err)));

  @Effect() updateInvestmentAgreement$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT)
    .switchMap(action => this.tffService.updateInvestmentAgreement(action.payload)
      .map(payload => new actions.UpdateInvestmentAgreementCompleteAction(payload))
      .catch(err => handleApiError(actions.UpdateInvestmentAgreementFailedAction, err)));

  @Effect() getGlobalStatsList$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_GLOBAL_STATS_LIST)
    .withLatestFrom(this.store.let(getGlobalStatsList))
    .switchMap(action => this.tffService.getGlobalStatsList()
      .map(payload => new actions.GetGlobalStatsListCompleteAction(payload))
      .catch(err => handleApiError(actions.GetGlobalStatsListFailedAction, err)));

  @Effect() getGlobalStats$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_GLOBAL_STATS)
    .switchMap(action => this.tffService.getGlobalStats(action.payload)
      .map(payload => new actions.GetGlobalStatsCompleteAction(payload))
      .catch(err => handleApiError(actions.GetGlobalStatsFailedAction, err)));

  @Effect() updateGlobalStats$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.UPDATE_GLOBAL_STATS)
    .switchMap(action => this.tffService.updateGlobalStats(action.payload)
      .map(payload => new actions.UpdateGlobalStatsCompleteAction(payload))
      .catch(err => handleApiError(actions.UpdateGlobalStatsFailedAction, err)));

  constructor(private actions$: Actions,
              private tffService: TffService,
              private store: Store<IAppState>) {
  }
}
