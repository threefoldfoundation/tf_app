import { Action } from '@ngrx/store';
import { type } from '../../../framework/client/core/utils/type';
import { ApiRequestStatus } from '../../../framework/client/rpc/rpc.interfaces';
import { Profile, SearchUsersQuery, UserList } from '../../../its_you_online_auth/client/index';
import { AgendaEvent, EventParticipant, GetEventParticipantsPayload } from '../interfaces/agenda-events.interfaces';
import {
  CreateTransactionPayload,
  GlobalStats,
  InvestmentAgreement,
  InvestmentAgreementList,
  InvestmentAgreementsQuery,
  NodeOrder,
  NodeOrderList,
  NodeOrdersQuery,
  Transaction,
  TransactionList,
  WalletBalance
} from '../interfaces/index';
import { PaginatedResult } from '../interfaces/shared.interfaces';

// duplicated code needed else the type of the action type is only 'string'

export interface ITffActionTypes {
  GET_ORDERS: '[TFF] Get orders';
  GET_ORDERS_COMPLETE: '[TFF] Get orders success';
  GET_ORDERS_FAILED: '[TFF] Get orders failed';
  RESET_ORDER: '[TFF] Reset order';
  GET_ORDER: '[TFF] Get order';
  GET_ORDER_COMPLETE: '[TFF] Get order success';
  GET_ORDER_FAILED: '[TFF] Get order failed';
  UPDATE_ORDER: '[TFF] Update order';
  UPDATE_ORDER_COMPLETE: '[TFF] Update order success';
  UPDATE_ORDER_FAILED: '[TFF] Update order failed';
  GET_INVESTMENT_AGREEMENTS: '[TFF] Get investment agreements';
  GET_INVESTMENT_AGREEMENTS_COMPLETE: '[TFF] Get investment agreements success';
  GET_INVESTMENT_AGREEMENTS_FAILED: '[TFF] Get investment agreements failed';
  RESET_INVESTMENT_AGREEMENT: '[TFF] Reset investment agreement';
  GET_INVESTMENT_AGREEMENT: '[TFF] Get investment agreement';
  GET_INVESTMENT_AGREEMENT_COMPLETE: '[TFF] Get investment agreement success';
  GET_INVESTMENT_AGREEMENT_FAILED: '[TFF] Get investment agreement failed';
  UPDATE_INVESTMENT_AGREEMENT: '[TFF] Update investment agreement';
  UPDATE_INVESTMENT_AGREEMENT_COMPLETE: '[TFF] Update investment agreement success';
  UPDATE_INVESTMENT_AGREEMENT_FAILED: '[TFF] Update investment agreement failed';
  GET_GLOBAL_STATS_LIST: '[TFF] Get global stats list';
  GET_GLOBAL_STATS_LIST_COMPLETE: '[TFF] Get global stats list success';
  GET_GLOBAL_STATS_LIST_FAILED: '[TFF] Get global stats list failed';
  GET_GLOBAL_STATS: '[TFF] Get global stats';
  GET_GLOBAL_STATS_COMPLETE: '[TFF] Get global stats success';
  GET_GLOBAL_STATS_FAILED: '[TFF] Get global stats failed';
  UPDATE_GLOBAL_STATS: '[TFF] Update global stats';
  UPDATE_GLOBAL_STATS_COMPLETE: '[TFF] Update global stats success';
  UPDATE_GLOBAL_STATS_FAILED: '[TFF] Update global stats failed';
  SEARCH_USERS: '[TFF] Search users';
  SEARCH_USERS_COMPLETE: '[TFF] Search users success';
  SEARCH_USERS_FAILED: '[TFF] Search users failed';
  GET_USER: '[TFF] Get user';
  GET_USER_COMPLETE: '[TFF] Get user success';
  GET_USER_FAILED: '[TFF] Get user failed';
  GET_BALANCE: '[TFF] Get balance';
  GET_BALANCE_COMPLETE: '[TFF] Get balance complete';
  GET_BALANCE_FAILED: '[TFF] Get balance failed';
  GET_USER_TRANSACTIONS: '[TFF] Get user transactions';
  GET_USER_TRANSACTIONS_COMPLETE: '[TFF] Get user transactions success';
  GET_USER_TRANSACTIONS_FAILED: '[TFF] Get user transactions failed';
  RESET_NEW_TRANSACTION: '[TFF] Reset new transaction';
  CREATE_TRANSACTION: '[TFF] Create transaction';
  CREATE_TRANSACTION_COMPLETE: '[TFF] Create transaction success';
  CREATE_TRANSACTION_FAILED: '[TFF] Create transaction failed';
  GET_AGENDA_EVENTS: '[TFF] Get agenda events ';
  GET_AGENDA_EVENTS_COMPLETE: '[TFF] Get agenda events success';
  GET_AGENDA_EVENTS_FAILED: '[TFF] Get agenda events failed';
  GET_AGENDA_EVENT: '[TFF] Get agenda event ';
  GET_AGENDA_EVENT_COMPLETE: '[TFF] Get agenda event success';
  GET_AGENDA_EVENT_FAILED: '[TFF] Get agenda event failed';
  RESET_AGENDA_EVENT: '[TFF] Reset agenda event ';
  CREATE_AGENDA_EVENT: '[TFF] Create agenda event ';
  CREATE_AGENDA_EVENT_COMPLETE: '[TFF] Create agenda event success';
  CREATE_AGENDA_EVENT_FAILED: '[TFF] Create agenda event failed';
  UPDATE_AGENDA_EVENT: '[TFF] Update agenda event ';
  UPDATE_AGENDA_EVENT_COMPLETE: '[TFF] Update agenda event success';
  UPDATE_AGENDA_EVENT_FAILED: '[TFF] Update agenda event failed';
  GET_EVENT_PARTICIPANTS: '[TFF] Get event participants';
  GET_EVENT_PARTICIPANTS_COMPLETE: '[TFF] Get event participants success';
  GET_EVENT_PARTICIPANTS_FAILED: '[TFF] Get event participants failed';
}

export const TffActionTypes: ITffActionTypes = {
  GET_ORDERS: type('[TFF] Get orders'),
  GET_ORDERS_COMPLETE: type('[TFF] Get orders success'),
  GET_ORDERS_FAILED: type('[TFF] Get orders failed'),
  RESET_ORDER: type('[TFF] Reset order'),
  GET_ORDER: type('[TFF] Get order'),
  GET_ORDER_COMPLETE: type('[TFF] Get order success'),
  GET_ORDER_FAILED: type('[TFF] Get order failed'),
  UPDATE_ORDER: type('[TFF] Update order'),
  UPDATE_ORDER_COMPLETE: type('[TFF] Update order success'),
  UPDATE_ORDER_FAILED: type('[TFF] Update order failed'),
  GET_INVESTMENT_AGREEMENTS: type('[TFF] Get investment agreements'),
  GET_INVESTMENT_AGREEMENTS_COMPLETE: type('[TFF] Get investment agreements success'),
  GET_INVESTMENT_AGREEMENTS_FAILED: type('[TFF] Get investment agreements failed'),
  RESET_INVESTMENT_AGREEMENT: type('[TFF] Reset investment agreement'),
  GET_INVESTMENT_AGREEMENT: type('[TFF] Get investment agreement'),
  GET_INVESTMENT_AGREEMENT_COMPLETE: type('[TFF] Get investment agreement success'),
  GET_INVESTMENT_AGREEMENT_FAILED: type('[TFF] Get investment agreement failed'),
  UPDATE_INVESTMENT_AGREEMENT: type('[TFF] Update investment agreement'),
  UPDATE_INVESTMENT_AGREEMENT_COMPLETE: type('[TFF] Update investment agreement success'),
  UPDATE_INVESTMENT_AGREEMENT_FAILED: type('[TFF] Update investment agreement failed'),
  GET_GLOBAL_STATS_LIST: type('[TFF] Get global stats list'),
  GET_GLOBAL_STATS_LIST_COMPLETE: type('[TFF] Get global stats list success'),
  GET_GLOBAL_STATS_LIST_FAILED: type('[TFF] Get global stats list failed'),
  GET_GLOBAL_STATS: type('[TFF] Get global stats'),
  GET_GLOBAL_STATS_COMPLETE: type('[TFF] Get global stats success'),
  GET_GLOBAL_STATS_FAILED: type('[TFF] Get global stats failed'),
  UPDATE_GLOBAL_STATS: type('[TFF] Update global stats'),
  UPDATE_GLOBAL_STATS_COMPLETE: type('[TFF] Update global stats success'),
  UPDATE_GLOBAL_STATS_FAILED: type('[TFF] Update global stats failed'),
  SEARCH_USERS: type('[TFF] Search users'),
  SEARCH_USERS_COMPLETE: type('[TFF] Search users success'),
  SEARCH_USERS_FAILED: type('[TFF] Search users failed'),
  GET_USER: type('[TFF] Get user'),
  GET_USER_COMPLETE: type('[TFF] Get user success'),
  GET_USER_FAILED: type('[TFF] Get user failed'),
  GET_BALANCE: type('[TFF] Get balance'),
  GET_BALANCE_COMPLETE: type('[TFF] Get balance complete'),
  GET_BALANCE_FAILED: type('[TFF] Get balance failed'),
  GET_USER_TRANSACTIONS: type('[TFF] Get user transactions'),
  GET_USER_TRANSACTIONS_COMPLETE: type('[TFF] Get user transactions success'),
  GET_USER_TRANSACTIONS_FAILED: type('[TFF] Get user transactions failed'),
  RESET_NEW_TRANSACTION: type('[TFF] Reset new transaction'),
  CREATE_TRANSACTION: type('[TFF] Create transaction'),
  CREATE_TRANSACTION_COMPLETE: type('[TFF] Create transaction success'),
  CREATE_TRANSACTION_FAILED: type('[TFF] Create transaction failed'),
  GET_AGENDA_EVENTS: type('[TFF] Get agenda events '),
  GET_AGENDA_EVENTS_COMPLETE: type('[TFF] Get agenda events success'),
  GET_AGENDA_EVENTS_FAILED: type('[TFF] Get agenda events failed'),
  GET_AGENDA_EVENT: type('[TFF] Get agenda event '),
  GET_AGENDA_EVENT_COMPLETE: type('[TFF] Get agenda event success'),
  GET_AGENDA_EVENT_FAILED: type('[TFF] Get agenda event failed'),
  RESET_AGENDA_EVENT: type('[TFF] Reset agenda event '),
  CREATE_AGENDA_EVENT: type('[TFF] Create agenda event '),
  CREATE_AGENDA_EVENT_COMPLETE: type('[TFF] Create agenda event success'),
  CREATE_AGENDA_EVENT_FAILED: type('[TFF] Create agenda event failed'),
  UPDATE_AGENDA_EVENT: type('[TFF] Update agenda event '),
  UPDATE_AGENDA_EVENT_COMPLETE: type('[TFF] Update agenda event success'),
  UPDATE_AGENDA_EVENT_FAILED: type('[TFF] Update agenda event failed'),
  GET_EVENT_PARTICIPANTS: type('[TFF] Get event participants'),
  GET_EVENT_PARTICIPANTS_COMPLETE: type('[TFF] Get event participants success'),
  GET_EVENT_PARTICIPANTS_FAILED: type('[TFF] Get event participants failed'),
};

export class GetOrdersAction implements Action {
  type = TffActionTypes.GET_ORDERS;

  constructor(public payload: NodeOrdersQuery) {
  }
}

export class GetOrdersCompleteAction implements Action {
  type = TffActionTypes.GET_ORDERS_COMPLETE;

  constructor(public payload: NodeOrderList) {
  }
}

export class GetOrdersFailedAction implements Action {
  type = TffActionTypes.GET_ORDERS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetNodeOrderAction implements Action {
  type = TffActionTypes.RESET_ORDER;
}

export class GetOrderAction implements Action {
  type = TffActionTypes.GET_ORDER;

  constructor(public payload: string) {
  }
}

export class GetOrderCompleteAction implements Action {
  type = TffActionTypes.GET_ORDER_COMPLETE;

  constructor(public payload: NodeOrder) {
  }
}

export class GetOrderFailedAction implements Action {
  type = TffActionTypes.GET_ORDER_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateOrderAction implements Action {
  type = TffActionTypes.UPDATE_ORDER;

  constructor(public payload: NodeOrder) {
  }
}

export class UpdateOrderCompleteAction implements Action {
  type = TffActionTypes.UPDATE_ORDER_COMPLETE;

  constructor(public payload: NodeOrder) {
  }
}

export class UpdateOrderFailedAction implements Action {
  type = TffActionTypes.UPDATE_ORDER_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetInvestmentAgreementsAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENTS;

  constructor(public payload: InvestmentAgreementsQuery) {
  }
}

export class GetInvestmentAgreementsCompleteAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENTS_COMPLETE;

  constructor(public payload: InvestmentAgreementList) {
  }
}

export class GetInvestmentAgreementsFailedAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENTS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetInvestmentAgreementAction implements Action {
  type = TffActionTypes.RESET_INVESTMENT_AGREEMENT;
}

export class GetInvestmentAgreementAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENT;

  constructor(public payload: string) {
  }
}

export class GetInvestmentAgreementCompleteAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENT_COMPLETE;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class GetInvestmentAgreementFailedAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateInvestmentAgreementAction implements Action {
  type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class UpdateInvestmentAgreementCompleteAction implements Action {
  type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_COMPLETE;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class UpdateInvestmentAgreementFailedAction implements Action {
  type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetGlobalStatsListAction implements Action {
  type = TffActionTypes.GET_GLOBAL_STATS_LIST;
  payload: null = null;
}

export class GetGlobalStatsListCompleteAction implements Action {
  type = TffActionTypes.GET_GLOBAL_STATS_LIST_COMPLETE;

  constructor(public payload: GlobalStats[]) {
  }
}

export class GetGlobalStatsListFailedAction implements Action {
  type = TffActionTypes.GET_GLOBAL_STATS_LIST_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetGlobalStatsAction implements Action {
  type = TffActionTypes.GET_GLOBAL_STATS;

  constructor(public payload: string) {
  }
}

export class GetGlobalStatsCompleteAction implements Action {
  type = TffActionTypes.GET_GLOBAL_STATS_COMPLETE;

  constructor(public payload: GlobalStats) {
  }
}

export class GetGlobalStatsFailedAction implements Action {
  type = TffActionTypes.GET_GLOBAL_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateGlobalStatsAction implements Action {
  type = TffActionTypes.UPDATE_GLOBAL_STATS;

  constructor(public payload: GlobalStats) {
  }
}

export class UpdateGlobalStatsCompleteAction implements Action {
  type = TffActionTypes.UPDATE_GLOBAL_STATS_COMPLETE;

  constructor(public payload: GlobalStats) {
  }
}

export class UpdateGlobalStatsFailedAction implements Action {
  type = TffActionTypes.UPDATE_GLOBAL_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class SearchUsersAction implements Action {
  type = TffActionTypes.SEARCH_USERS;

  constructor(public payload: SearchUsersQuery) {
  }
}

export class SearchUsersCompleteAction implements Action {
  type = TffActionTypes.SEARCH_USERS_COMPLETE;

  constructor(public payload: UserList) {
  }
}

export class SearchUsersFailedAction implements Action {
  type = TffActionTypes.SEARCH_USERS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetUserAction implements Action {
  type = TffActionTypes.GET_USER;

  constructor(public payload: string) {
  }
}

export class GetUserCompleteAction implements Action {
  type = TffActionTypes.GET_USER_COMPLETE;

  constructor(public payload: Profile) {
  }
}

export class GetUserFailedAction implements Action {
  type = TffActionTypes.GET_USER_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetUserTransactionsAction implements Action {
  type = TffActionTypes.GET_USER_TRANSACTIONS;

  constructor(public payload: string) {
  }
}

export class GetUserTransactionsCompleteAction implements Action {
  type = TffActionTypes.GET_USER_TRANSACTIONS_COMPLETE;

  constructor(public payload: TransactionList) {
  }
}

export class GetUserTransactionsFailedAction implements Action {
  type = TffActionTypes.GET_USER_TRANSACTIONS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetBalanceAction implements Action {
  type = TffActionTypes.GET_BALANCE;

  constructor(public payload: string) {
  }
}

export class GetBalanceCompleteAction implements Action {
  type = TffActionTypes.GET_BALANCE_COMPLETE;

  constructor(public payload: WalletBalance[]) {
  }
}

export class GetBalanceFailedAction implements Action {
  type = TffActionTypes.GET_BALANCE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetNewTransactionAction implements Action {
  type = TffActionTypes.RESET_NEW_TRANSACTION;
  payload: null = null;
}

export class CreateTransactionAction implements Action {
  type = TffActionTypes.CREATE_TRANSACTION;

  constructor(public payload: CreateTransactionPayload) {
  }
}

export class CreateTransactionCompleteAction implements Action {
  type = TffActionTypes.CREATE_TRANSACTION_COMPLETE;

  constructor(public payload: Transaction) {
  }
}

export class CreateTransactionFailedAction implements Action {
  type = TffActionTypes.CREATE_TRANSACTION_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetAgendaEventsAction implements Action {
  type = TffActionTypes.GET_AGENDA_EVENTS;
}

export class GetAgendaEventsCompleteAction implements Action {
  type = TffActionTypes.GET_AGENDA_EVENTS_COMPLETE;

  constructor(public payload: AgendaEvent[]) {
  }
}

export class GetAgendaEventsFailedAction implements Action {
  type = TffActionTypes.GET_AGENDA_EVENTS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetAgendaEventAction implements Action {
  type = TffActionTypes.GET_AGENDA_EVENT;

  constructor(public payload: number) {
  }
}

export class GetAgendaEventCompleteAction implements Action {
  type = TffActionTypes.GET_AGENDA_EVENT_COMPLETE;

  constructor(public payload: AgendaEvent) {
  }
}

export class GetAgendaEventFailedAction implements Action {
  type = TffActionTypes.GET_AGENDA_EVENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetAgendaEventAction implements Action {
  type = TffActionTypes.RESET_AGENDA_EVENT;
}


export class CreateAgendaEventAction implements Action {
  type = TffActionTypes.CREATE_AGENDA_EVENT;

  constructor(public payload: AgendaEvent) {
  }
}

export class CreateAgendaEventCompleteAction implements Action {
  type = TffActionTypes.CREATE_AGENDA_EVENT_COMPLETE;

  constructor(public payload: AgendaEvent) {
  }
}

export class CreateAgendaEventFailedAction implements Action {
  type = TffActionTypes.CREATE_AGENDA_EVENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateAgendaEventAction implements Action {
  type = TffActionTypes.UPDATE_AGENDA_EVENT;

  constructor(public payload: AgendaEvent) {
  }
}

export class UpdateAgendaEventCompleteAction implements Action {
  type = TffActionTypes.UPDATE_AGENDA_EVENT_COMPLETE;

  constructor(public payload: AgendaEvent) {
  }
}

export class UpdateAgendaEventFailedAction implements Action {
  type = TffActionTypes.UPDATE_AGENDA_EVENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetEventParticipantsAction implements Action {
  type = TffActionTypes.GET_EVENT_PARTICIPANTS;

  constructor(public payload: GetEventParticipantsPayload) {
  }
}

export class GetEventParticipantsCompleteAction implements Action {
  type = TffActionTypes.GET_EVENT_PARTICIPANTS_COMPLETE;

  constructor(public payload: PaginatedResult<EventParticipant>) {
  }
}

export class GetEventParticipantsFailedAction implements Action {
  type = TffActionTypes.GET_EVENT_PARTICIPANTS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export type TffActions
  = GetOrdersAction
  | GetOrdersCompleteAction
  | GetOrdersFailedAction
  | ResetNodeOrderAction
  | GetOrderAction
  | GetOrderCompleteAction
  | GetOrderFailedAction
  | UpdateOrderAction
  | UpdateOrderCompleteAction
  | UpdateOrderFailedAction
  | GetInvestmentAgreementsAction
  | GetInvestmentAgreementsCompleteAction
  | GetInvestmentAgreementsFailedAction
  | ResetInvestmentAgreementAction
  | GetInvestmentAgreementAction
  | GetInvestmentAgreementCompleteAction
  | GetInvestmentAgreementFailedAction
  | UpdateInvestmentAgreementAction
  | UpdateInvestmentAgreementCompleteAction
  | UpdateInvestmentAgreementFailedAction
  | GetGlobalStatsListAction
  | GetGlobalStatsListCompleteAction
  | GetGlobalStatsListFailedAction
  | GetGlobalStatsAction
  | GetGlobalStatsCompleteAction
  | GetGlobalStatsFailedAction
  | UpdateGlobalStatsAction
  | UpdateGlobalStatsCompleteAction
  | UpdateGlobalStatsFailedAction
  | SearchUsersAction
  | SearchUsersCompleteAction
  | SearchUsersFailedAction
  | GetUserAction
  | GetUserCompleteAction
  | GetUserFailedAction
  | GetUserTransactionsAction
  | GetUserTransactionsCompleteAction
  | GetUserTransactionsFailedAction
  | GetBalanceAction
  | GetBalanceCompleteAction
  | GetBalanceFailedAction
  | ResetNewTransactionAction
  | CreateTransactionAction
  | CreateTransactionCompleteAction
  | CreateTransactionFailedAction
  | GetAgendaEventsAction
  | GetAgendaEventsCompleteAction
  | GetAgendaEventsFailedAction
  | GetAgendaEventAction
  | GetAgendaEventCompleteAction
  | GetAgendaEventFailedAction
  | ResetAgendaEventAction
  | CreateAgendaEventAction
  | CreateAgendaEventCompleteAction
  | CreateAgendaEventFailedAction
  | UpdateAgendaEventAction
  | UpdateAgendaEventCompleteAction
  | UpdateAgendaEventFailedAction
  | GetEventParticipantsAction
  | GetEventParticipantsCompleteAction
  | GetEventParticipantsFailedAction;
