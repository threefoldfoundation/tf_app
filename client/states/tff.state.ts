import { Observable } from 'rxjs/Observable';
import { GlobalStats, InvestmentAgreement, InvestmentAgreementList, NodeOrder, NodeOrderList } from '../interfaces/index';
import { apiRequestInitial, ApiRequestStatus } from '../../../framework/client/rpc/rpc.interfaces';
import { InvestmentAgreementsStatuses } from '../interfaces/investment-agreements.interfaces';
import { NodeOrderStatuses } from '../interfaces/nodes.interfaces';

export interface ITffState {
  orders: NodeOrderList;
  ordersStatus: ApiRequestStatus;
  order: NodeOrder | null;
  ordersType: NodeOrderStatuses;
  orderStatus: ApiRequestStatus;
  updateOrderStatus: ApiRequestStatus;
  investmentAgreements: InvestmentAgreementList;
  investmentAgreementsType: InvestmentAgreementsStatuses;
  investmentAgreementsStatus: ApiRequestStatus;
  investmentAgreement: InvestmentAgreement | null;
  investmentAgreementStatus: ApiRequestStatus;
  updateInvestmentAgreementStatus: ApiRequestStatus;
  globalStatsList: GlobalStats[];
  globalStatsListStatus: ApiRequestStatus;
  globalStats: GlobalStats | null;
  globalStatsStatus: ApiRequestStatus;
  updateGlobalStatsStatus: ApiRequestStatus;
}

export const initialTffState: ITffState = {
  orders: {
    cursor: null,
    more: false,
    results: []
  },
  ordersStatus: apiRequestInitial,
  order: null,
  ordersType: NodeOrderStatuses.SIGNED,
  orderStatus: apiRequestInitial,
  updateOrderStatus: apiRequestInitial,
  investmentAgreements: {
    cursor: null,
    more: false,
    results: []
  },
  investmentAgreementsStatus: apiRequestInitial,
  investmentAgreement: null,
  investmentAgreementsType: InvestmentAgreementsStatuses.CREATED,
  investmentAgreementStatus: apiRequestInitial,
  updateInvestmentAgreementStatus: apiRequestInitial,
  globalStatsList: [],
  globalStatsListStatus: apiRequestInitial,
  globalStats: null,
  globalStatsStatus: apiRequestInitial,
  updateGlobalStatsStatus: apiRequestInitial,
};

export function getOrders(state$: Observable<ITffState>) {
  return state$.select(state => state.orders);
}

export function getNodeOrdersType(state$: Observable<ITffState>) {
  return state$.select(state => state.ordersType);
}

export function getOrdersStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.ordersStatus);
}

export function getOrder(state$: Observable<ITffState>) {
  return state$.select(state => state.order);
}

export function getOrderStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.orderStatus);
}

export function updateOrderStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.updateOrderStatus);
}

export function getInvestmentAgreements(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreements);
}

export function getInvestmentAgreementsType(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreementsType);
}

export function getInvestmentAgreementsStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreementsStatus);
}

export function getInvestmentAgreement(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreement);
}

export function getInvestmentAgreementStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreementStatus);
}

export function updateInvestmentAgreementStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.updateInvestmentAgreementStatus);
}

export function getGlobalStatsList(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStatsList);
}

export function getGlobalStatsListStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStatsListStatus);
}

export function getGlobalStats(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStats);
}

export function getGlobalStatsStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStatsStatus);
}

export function updateGlobalStatsStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.updateGlobalStatsStatus);
}
