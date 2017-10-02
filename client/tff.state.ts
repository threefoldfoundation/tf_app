import { Observable } from 'rxjs/Observable';
import '@ngrx/core/add/operator/select';
import { compose } from '@ngrx/core/compose';
import * as fromTff from './states/index';
import { IAppState } from '../../framework/client/ngrx/state/app.state';

export function getTffState(state$: Observable<IAppState>) {
  return state$.select(s => s.tff);
}


export const getOrders = compose(fromTff.getOrders, getTffState);
export const getNodeOrdersType = compose(fromTff.getNodeOrdersType, getTffState);
export const getOrdersStatus = compose(fromTff.getOrdersStatus, getTffState);
export const getOrder = compose(fromTff.getOrder, getTffState);
export const getOrderStatus = compose(fromTff.getOrderStatus, getTffState);
export const updateOrderStatus = compose(fromTff.updateOrderStatus, getTffState);
export const getInvestmentAgreements = compose(fromTff.getInvestmentAgreements, getTffState);
export const getInvestmentAgreementsType = compose(fromTff.getInvestmentAgreementsType, getTffState);
export const getInvestmentAgreementsStatus = compose(fromTff.getInvestmentAgreementsStatus, getTffState);
export const getInvestmentAgreement = compose(fromTff.getInvestmentAgreement, getTffState);
export const getInvestmentAgreementStatus = compose(fromTff.getInvestmentAgreementStatus, getTffState);
export const updateInvestmentAgreementStatus = compose(fromTff.updateInvestmentAgreementStatus, getTffState);
export const getGlobalStatsList = compose(fromTff.getGlobalStatsList, getTffState);
export const getGlobalStatsListStatus = compose(fromTff.getGlobalStatsListStatus, getTffState);
export const getGlobalStats = compose(fromTff.getGlobalStats, getTffState);
export const getGlobalStatsStatus = compose(fromTff.getGlobalStatsStatus, getTffState);
export const updateGlobalStatsStatus = compose(fromTff.updateGlobalStatsStatus, getTffState);
