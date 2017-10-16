import { Observable } from 'rxjs/Observable';
import {
  GlobalStats,
  InvestmentAgreement,
  InvestmentAgreementList,
  InvestmentAgreementsQuery,
  NodeOrder,
  NodeOrderList,
  NodeOrdersQuery
} from '../interfaces/index';
import { apiRequestInitial, ApiRequestStatus } from '../../../framework/client/rpc/rpc.interfaces';
import { Profile, SearchUsersQuery, UserList } from '../../../its_you_online_auth/client/interfaces/user.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { InvestmentAgreement, InvestmentAgreementList, InvestmentAgreementsStatuses } from '../interfaces/investment-agreements.interfaces';
import { NodeOrder, NodeOrderList, NodeOrderStatuses } from '../interfaces/nodes.interfaces';
import { PaginatedResult } from '../interfaces/shared.interfaces';
import { TransactionList, WalletBalance } from '../interfaces/transactions';

export interface ITffState {
  orders: NodeOrderList;
  ordersStatus: ApiRequestStatus;
  order: NodeOrder | null;
  ordersQuery: NodeOrdersQuery;
  orderStatus: ApiRequestStatus;
  updateOrderStatus: ApiRequestStatus;
  investmentAgreements: InvestmentAgreementList;
  investmentAgreementsQuery: InvestmentAgreementsQuery;
  investmentAgreementsStatus: ApiRequestStatus;
  investmentAgreement: InvestmentAgreement | null;
  investmentAgreementStatus: ApiRequestStatus;
  updateInvestmentAgreementStatus: ApiRequestStatus;
  globalStatsList: GlobalStats[];
  globalStatsListStatus: ApiRequestStatus;
  globalStats: GlobalStats | null;
  globalStatsStatus: ApiRequestStatus;
  updateGlobalStatsStatus: ApiRequestStatus;
  userListQuery: SearchUsersQuery;
  userList: UserList;
  userListStatus: ApiRequestStatus;
  user: Profile | null;
  userStatus: ApiRequestStatus;
  userTransactions: TransactionList;
  userTransactionsStatus: ApiRequestStatus;
  createTransactionStatus: ApiRequestStatus;
  balance: WalletBalance[];
  balanceStatus: ApiRequestStatus;
}

export const emptyPaginatedResult: PaginatedResult<any> = {
  cursor: null,
  more: false,
  results: []
};

export const initialTffState: ITffState = {
  orders: emptyPaginatedResult,
  ordersStatus: apiRequestInitial,
  order: null,
  ordersQuery: {
    cursor: null,
    status: null,
    query: null,
  },
  orderStatus: apiRequestInitial,
  updateOrderStatus: apiRequestInitial,
  investmentAgreements: emptyPaginatedResult,
  investmentAgreementsStatus: apiRequestInitial,
  investmentAgreement: null,
  investmentAgreementsQuery: {
    cursor: null,
    status: null,
    query: null,
  },
  investmentAgreementStatus: apiRequestInitial,
  updateInvestmentAgreementStatus: apiRequestInitial,
  globalStatsList: [],
  globalStatsListStatus: apiRequestInitial,
  globalStats: null,
  globalStatsStatus: apiRequestInitial,
  updateGlobalStatsStatus: apiRequestInitial,
  userListQuery: {
    query: null,
    cursor: null,
  },
  userList: emptyPaginatedResult,
  userListStatus: apiRequestInitial,
  user: null,
  userStatus: apiRequestInitial,
  userTransactions: emptyPaginatedResult,
  userTransactionsStatus: apiRequestInitial,
  createTransactionStatus: apiRequestInitial,
  balance: [],
  balanceStatus: apiRequestInitial,
};

export function _getOrders(state$: Observable<ITffState>) {
  return state$.select(state => state.orders);
}

export function getNodeOrdersQuery(state$: Observable<ITffState>) {
  return state$.select(state => state.ordersQuery);
}

export function _getOrdersStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.ordersStatus);
}

export function _getOrder(state$: Observable<ITffState>) {
  return state$.select(state => state.order);
}

export function _getOrderStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.orderStatus);
}

export function _updateOrderStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.updateOrderStatus);
}

export function _getInvestmentAgreements(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreements);
}

export function getInvestmentAgreementsQuery(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreementsQuery);
}

export function _getInvestmentAgreementsStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreementsStatus);
}

export function _getInvestmentAgreement(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreement);
}

export function _getInvestmentAgreementStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.investmentAgreementStatus);
}

export function _updateInvestmentAgreementStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.updateInvestmentAgreementStatus);
}

export function _getGlobalStatsList(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStatsList);
}

export function _getGlobalStatsListStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStatsListStatus);
}

export function _getGlobalStats(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStats);
}

export function _getGlobalStatsStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.globalStatsStatus);
}

export function _updateGlobalStatsStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.updateGlobalStatsStatus);
}

export function _getUserList(state$: Observable<ITffState>) {
  return state$.select(state => state.userList);
}

export function _getUserListQuery(state$: Observable<ITffState>) {
  return state$.select(state => state.userListQuery);
}

export function _getUserListStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.userListStatus);
}

export function _getUser(state$: Observable<ITffState>) {
  return state$.select(state => state.user);
}

export function _getUserStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.userStatus);
}

export function _getBalance(state$: Observable<ITffState>) {
  return state$.select(state => state.balance);
}

export function _getBalanceStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.balanceStatus);
}

export function _getUserTransactions(state$: Observable<ITffState>) {
  return state$.select(state => state.userTransactions);
}

export function _getUserTransactionsStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.userTransactionsStatus);
}

export function _createTransactionStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.createTransactionStatus);
}
