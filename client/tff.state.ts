import '@ngrx/core/add/operator/select';
import { compose } from '@ngrx/core/compose';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../framework/client/ngrx/state/app.state';
import * as fromTff from './states/index';
import { ITffState } from './states/tff.state';

export function getTffState(state$: Observable<IAppState>): Observable<ITffState> {
  return state$.select(s => s.tff);
}

export const getOrders = compose(fromTff._getOrders, getTffState);
export const getNodeOrdersType = compose(fromTff._getNodeOrdersType, getTffState);
export const getOrdersStatus = compose(fromTff._getOrdersStatus, getTffState);
export const getOrder = compose(fromTff._getOrder, getTffState);
export const getOrderStatus = compose(fromTff._getOrderStatus, getTffState);
export const updateOrderStatus = compose(fromTff._updateOrderStatus, getTffState);
export const getInvestmentAgreements = compose(fromTff._getInvestmentAgreements, getTffState);
export const getInvestmentAgreementsType = compose(fromTff._getInvestmentAgreementsType, getTffState);
export const getInvestmentAgreementsStatus = compose(fromTff._getInvestmentAgreementsStatus, getTffState);
export const getInvestmentAgreement = compose(fromTff._getInvestmentAgreement, getTffState);
export const getInvestmentAgreementStatus = compose(fromTff._getInvestmentAgreementStatus, getTffState);
export const updateInvestmentAgreementStatus = compose(fromTff._updateInvestmentAgreementStatus, getTffState);
export const getGlobalStatsList = compose(fromTff._getGlobalStatsList, getTffState);
export const getGlobalStatsListStatus = compose(fromTff._getGlobalStatsListStatus, getTffState);
export const getGlobalStats = compose(fromTff._getGlobalStats, getTffState);
export const getGlobalStatsStatus = compose(fromTff._getGlobalStatsStatus, getTffState);
export const updateGlobalStatsStatus = compose(fromTff._updateGlobalStatsStatus, getTffState);

export const getUserList = compose(fromTff._getUserList, getTffState);
export const getUserQueryList = compose(fromTff._getUserListQuery, getTffState);
export const getUserListStatus = compose(fromTff._getUserListStatus, getTffState);
export const getUser = compose(fromTff._getUser, getTffState);
export const getUserStatus = compose(fromTff._getUserStatus, getTffState);

export const getBalance = compose(fromTff._getBalance, getTffState);
export const getBalanceStatus = compose(fromTff._getBalanceStatus, getTffState);
export const getUserTransactions = compose(fromTff._getUserTransactions, getTffState);
export const getUserTransactionsStatus = compose(fromTff._getUserTransactionsStatus, getTffState);
export const createTransactionStatus = compose(fromTff._createTransactionStatus, getTffState);

export const getOrders = compose(fromTff.getOrders, getTffState);
export const getNodeOrdersQuery = compose(fromTff.getNodeOrdersQuery, getTffState);
export const getOrdersStatus = compose(fromTff.getOrdersStatus, getTffState);
export const getOrder = compose(fromTff.getOrder, getTffState);
export const getOrderStatus = compose(fromTff.getOrderStatus, getTffState);
export const updateOrderStatus = compose(fromTff.updateOrderStatus, getTffState);
export const getInvestmentAgreements = compose(fromTff.getInvestmentAgreements, getTffState);
export const getInvestmentAgreementsQuery = compose(fromTff.getInvestmentAgreementsQuery, getTffState);
export const getInvestmentAgreementsStatus = compose(fromTff.getInvestmentAgreementsStatus, getTffState);
export const getInvestmentAgreement = compose(fromTff.getInvestmentAgreement, getTffState);
export const getInvestmentAgreementStatus = compose(fromTff.getInvestmentAgreementStatus, getTffState);
export const updateInvestmentAgreementStatus = compose(fromTff.updateInvestmentAgreementStatus, getTffState);
export const getGlobalStatsList = compose(fromTff.getGlobalStatsList, getTffState);
export const getGlobalStatsListStatus = compose(fromTff.getGlobalStatsListStatus, getTffState);
export const getGlobalStats = compose(fromTff.getGlobalStats, getTffState);
export const getGlobalStatsStatus = compose(fromTff.getGlobalStatsStatus, getTffState);
export const updateGlobalStatsStatus = compose(fromTff.updateGlobalStatsStatus, getTffState);
