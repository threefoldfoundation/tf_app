import { Action } from '@ngrx/store';
import { ApiRequestStatus } from '../../../framework/client/rpc';
import { Profile } from '../../../its_you_online_auth/client';
import { Installation, InstallationLog, InstallationsList } from '../../../rogerthat_api/client/interfaces';
import {
  AgendaEvent,
  Check,
  CreateInvestmentAgreementPayload,
  CreateOrderPayload,
  CreateTransactionPayload,
  EventParticipant,
  FirebaseFlowStats,
  FlowRun,
  FlowRunList,
  FlowRunQuery,
  GetEventParticipantsPayload,
  GetInstallationsQuery,
  GlobalStats,
  InvestmentAgreement,
  InvestmentAgreementList,
  InvestmentAgreementsQuery,
  NodeInfo,
  NodeOrder,
  NodeOrderList,
  NodeOrdersQuery,
  NodesQuery,
  PaginatedResult,
  SearchUsersQuery,
  SetKYCStatusPayload,
  TffProfile,
  Transaction,
  TransactionList,
  UpdateNodePayload,
  UserFlowRunsQuery,
  UserList,
  UserNodeStatus,
  WalletBalance,
} from '../interfaces';

export const enum TffActionTypes {
  GET_ORDERS = '[TFF] Get orders',
  GET_ORDERS_COMPLETE = '[TFF] Get orders success',
  GET_ORDERS_FAILED = '[TFF] Get orders failed',
  RESET_ORDER = '[TFF] Reset order',
  GET_ORDER = '[TFF] Get order',
  GET_ORDER_COMPLETE = '[TFF] Get order success',
  GET_ORDER_FAILED = '[TFF] Get order failed',
  CREATE_ORDER = '[TFF] Create order',
  CREATE_ORDER_COMPLETE = '[TFF] Create order success',
  CREATE_ORDER_FAILED = '[TFF] Create order failed',
  UPDATE_ORDER = '[TFF] Update order',
  UPDATE_ORDER_COMPLETE = '[TFF] Update order success',
  UPDATE_ORDER_FAILED = '[TFF] Update order failed',
  GET_INVESTMENT_AGREEMENTS = '[TFF] Get investment agreements',
  GET_INVESTMENT_AGREEMENTS_COMPLETE = '[TFF] Get investment agreements success',
  GET_INVESTMENT_AGREEMENTS_FAILED = '[TFF] Get investment agreements failed',
  RESET_INVESTMENT_AGREEMENT = '[TFF] Reset investment agreement',
  GET_INVESTMENT_AGREEMENT = '[TFF] Get investment agreement',
  GET_INVESTMENT_AGREEMENT_COMPLETE = '[TFF] Get investment agreement success',
  GET_INVESTMENT_AGREEMENT_FAILED = '[TFF] Get investment agreement failed',
  UPDATE_INVESTMENT_AGREEMENT = '[TFF] Update investment agreement',
  UPDATE_INVESTMENT_AGREEMENT_COMPLETE = '[TFF] Update investment agreement success',
  UPDATE_INVESTMENT_AGREEMENT_FAILED = '[TFF] Update investment agreement failed',
  CREATE_INVESTMENT_AGREEMENT = '[TFF] Create investment agreement',
  CREATE_INVESTMENT_AGREEMENT_COMPLETE = '[TFF] Create investment agreement success',
  CREATE_INVESTMENT_AGREEMENT_FAILED = '[TFF] Create investment agreement failed',
  GET_GLOBAL_STATS_LIST = '[TFF] Get global stats list',
  GET_GLOBAL_STATS_LIST_COMPLETE = '[TFF] Get global stats list success',
  GET_GLOBAL_STATS_LIST_FAILED = '[TFF] Get global stats list failed',
  GET_GLOBAL_STATS = '[TFF] Get global stats',
  GET_GLOBAL_STATS_COMPLETE = '[TFF] Get global stats success',
  GET_GLOBAL_STATS_FAILED = '[TFF] Get global stats failed',
  UPDATE_GLOBAL_STATS = '[TFF] Update global stats',
  UPDATE_GLOBAL_STATS_COMPLETE = '[TFF] Update global stats success',
  UPDATE_GLOBAL_STATS_FAILED = '[TFF] Update global stats failed',
  SEARCH_USERS = '[TFF] Search users',
  SEARCH_USERS_COMPLETE = '[TFF] Search users success',
  SEARCH_USERS_FAILED = '[TFF] Search users failed',
  GET_USER = '[TFF] Get user',
  GET_USER_COMPLETE = '[TFF] Get user success',
  GET_USER_FAILED = '[TFF] Get user failed',
  GET_BALANCE = '[TFF] Get balance',
  GET_BALANCE_COMPLETE = '[TFF] Get balance complete',
  GET_BALANCE_FAILED = '[TFF] Get balance failed',
  GET_USER_TRANSACTIONS = '[TFF] Get user transactions',
  GET_USER_TRANSACTIONS_COMPLETE = '[TFF] Get user transactions success',
  GET_USER_TRANSACTIONS_FAILED = '[TFF] Get user transactions failed',
  RESET_NEW_TRANSACTION = '[TFF] Reset new transaction',
  CREATE_TRANSACTION = '[TFF] Create transaction',
  CREATE_TRANSACTION_COMPLETE = '[TFF] Create transaction success',
  CREATE_TRANSACTION_FAILED = '[TFF] Create transaction failed',
  GET_TFF_PROFILE = '[TFF] Get tff profile',
  GET_TFF_PROFILE_COMPLETE = '[TFF] Get tff profile complete',
  GET_TFF_PROFILE_FAILED = '[TFF] Get tff profile failed',
  SET_KYC_STATUS = '[TFF] Set KYC status',
  SET_KYC_STATUS_COMPLETE = '[TFF] Set KYC status complete',
  SET_KYC_STATUS_FAILED = '[TFF] Set KYC status failed',
  GET_AGENDA_EVENTS = '[TFF] Get agenda events ',
  GET_AGENDA_EVENTS_COMPLETE = '[TFF] Get agenda events success',
  GET_AGENDA_EVENTS_FAILED = '[TFF] Get agenda events failed',
  GET_AGENDA_EVENT = '[TFF] Get agenda event ',
  GET_AGENDA_EVENT_COMPLETE = '[TFF] Get agenda event success',
  GET_AGENDA_EVENT_FAILED = '[TFF] Get agenda event failed',
  RESET_AGENDA_EVENT = '[TFF] Reset agenda event ',
  CREATE_AGENDA_EVENT = '[TFF] Create agenda event ',
  CREATE_AGENDA_EVENT_COMPLETE = '[TFF] Create agenda event success',
  CREATE_AGENDA_EVENT_FAILED = '[TFF] Create agenda event failed',
  UPDATE_AGENDA_EVENT = '[TFF] Update agenda event ',
  UPDATE_AGENDA_EVENT_COMPLETE = '[TFF] Update agenda event success',
  UPDATE_AGENDA_EVENT_FAILED = '[TFF] Update agenda event failed',
  GET_EVENT_PARTICIPANTS = '[TFF] Get event participants',
  GET_EVENT_PARTICIPANTS_COMPLETE = '[TFF] Get event participants success',
  GET_EVENT_PARTICIPANTS_FAILED = '[TFF] Get event participants failed',
  GET_KYC_CHECKS = '[TFF] Get KYC checks',
  GET_KYC_CHECKS_COMPLETE = '[TFF] Get KYC checks complete',
  GET_KYC_CHECKS_FAILED = '[TFF] Get KYC checks failed',
  GET_USER_FLOW_RUNS = '[TFF] Get user flow runs',
  GET_USER_FLOW_RUNS_COMPLETE = '[TFF] Get user flow runs complete',
  GET_USER_FLOW_RUNS_FAILED = '[TFF] Get user flow runs failed',
  VERIFY_UTILITY_BILL = '[TFF] Set Verify utility bill',
  VERIFY_UTILITY_BILL_COMPLETE = '[TFF] Verify utility bill complete',
  VERIFY_UTILITY_BILL_FAILED = '[TFF] Verify utility bill failed',
  GET_FLOW_RUN_FLOWS = '[TFF] Get flow run flows',
  GET_FLOW_RUN_FLOWS_COMPLETE = '[TFF] Get flow run flows complete',
  GET_FLOW_RUN_FLOWS_FAILED = '[TFF] Get flow run flows failed',
  GET_FLOW_RUNS = '[TFF] Get flow runs',
  GET_FLOW_RUNS_COMPLETE = '[TFF] Get flow runs complete',
  GET_FLOW_RUNS_FAILED = '[TFF] Get flow runs failed',
  GET_FLOW_RUN = '[TFF] Get flow run',
  GET_FLOW_RUN_COMPLETE = '[TFF] Get flow run complete',
  GET_FLOW_RUN_FAILED = '[TFF] Get flow run failed',
  GET_FLOW_STATS = '[TFF] Get flow stats',
  GET_FLOW_STATS_COMPLETE = '[TFF] Get flow stats complete',
  GET_FLOW_STATS_FAILED = '[TFF] Get flow stats failed',
  GET_INSTALLATIONS = '[TFF] Get installations',
  GET_INSTALLATIONS_COMPLETE = '[TFF] Get installations complete',
  GET_INSTALLATIONS_FAILED = '[TFF] Get installations failed',
  GET_INSTALLATION = '[TFF] Get installation',
  GET_INSTALLATION_COMPLETE = '[TFF] Get installation complete',
  GET_INSTALLATION_FAILED = '[TFF] Get installation failed',
  GET_INSTALLATION_LOGS = '[TFF] Get installation logs',
  GET_INSTALLATION_LOGS_COMPLETE = '[TFF] Get installation logs complete',
  GET_INSTALLATION_LOGS_FAILED = '[TFF] Get installation logs failed',
  GET_NODES = '[TFF] Get nodes',
  GET_NODES_COMPLETE = '[TFF] Get nodes complete',
  GET_NODES_FAILED = '[TFF] Get nodes failed',
  GET_NODE = '[TFF] Get node',
  GET_NODE_COMPLETE = '[TFF] Get node complete',
  GET_NODE_FAILED = '[TFF] Get node failed',
  UPDATE_NODE = '[TFF] Update node',
  UPDATE_NODE_COMPLETE = '[TFF] Update node complete',
  UPDATE_NODE_FAILED = '[TFF] Update node failed',
  DELETE_NODE = '[TFF] Delete node',
  DELETE_NODE_COMPLETE = '[TFF] Delete node complete',
  DELETE_NODE_FAILED = '[TFF] Delete node failed',
}

export class GetOrdersAction implements Action {
  readonly type = TffActionTypes.GET_ORDERS;

  constructor(public payload: NodeOrdersQuery) {
  }
}

export class GetOrdersCompleteAction implements Action {
  readonly type = TffActionTypes.GET_ORDERS_COMPLETE;

  constructor(public payload: NodeOrderList) {
  }
}

export class GetOrdersFailedAction implements Action {
  readonly type = TffActionTypes.GET_ORDERS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetNodeOrderAction implements Action {
  readonly type = TffActionTypes.RESET_ORDER;
}

export class GetOrderAction implements Action {
  readonly type = TffActionTypes.GET_ORDER;

  constructor(public payload: string) {
  }
}

export class GetOrderCompleteAction implements Action {
  readonly type = TffActionTypes.GET_ORDER_COMPLETE;

  constructor(public payload: NodeOrder) {
  }
}

export class GetOrderFailedAction implements Action {
  readonly type = TffActionTypes.GET_ORDER_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class CreateOrderAction implements Action {
  readonly type = TffActionTypes.CREATE_ORDER;

  constructor(public payload: CreateOrderPayload) {
  }
}

export class CreateOrderCompleteAction implements Action {
  readonly type = TffActionTypes.CREATE_ORDER_COMPLETE;

  constructor(public payload: NodeOrder) {
  }
}

export class CreateOrderFailedAction implements Action {
  readonly type = TffActionTypes.CREATE_ORDER_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateOrderAction implements Action {
  readonly type = TffActionTypes.UPDATE_ORDER;

  constructor(public payload: NodeOrder) {
  }
}

export class UpdateOrderCompleteAction implements Action {
  readonly type = TffActionTypes.UPDATE_ORDER_COMPLETE;

  constructor(public payload: NodeOrder) {
  }
}

export class UpdateOrderFailedAction implements Action {
  readonly type = TffActionTypes.UPDATE_ORDER_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetInvestmentAgreementsAction implements Action {
  readonly type = TffActionTypes.GET_INVESTMENT_AGREEMENTS;

  constructor(public payload: InvestmentAgreementsQuery) {
  }
}

export class GetInvestmentAgreementsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_INVESTMENT_AGREEMENTS_COMPLETE;

  constructor(public payload: InvestmentAgreementList) {
  }
}

export class GetInvestmentAgreementsFailedAction implements Action {
  readonly type = TffActionTypes.GET_INVESTMENT_AGREEMENTS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetInvestmentAgreementAction implements Action {
  readonly type = TffActionTypes.RESET_INVESTMENT_AGREEMENT;
}

export class GetInvestmentAgreementAction implements Action {
  readonly type = TffActionTypes.GET_INVESTMENT_AGREEMENT;

  constructor(public payload: string) {
  }
}

export class GetInvestmentAgreementCompleteAction implements Action {
  readonly type = TffActionTypes.GET_INVESTMENT_AGREEMENT_COMPLETE;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class GetInvestmentAgreementFailedAction implements Action {
  readonly type = TffActionTypes.GET_INVESTMENT_AGREEMENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateInvestmentAgreementAction implements Action {
  readonly type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class UpdateInvestmentAgreementCompleteAction implements Action {
  readonly type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_COMPLETE;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class UpdateInvestmentAgreementFailedAction implements Action {
  readonly type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}
export class CreateInvestmentAgreementAction implements Action {
  readonly type = TffActionTypes.CREATE_INVESTMENT_AGREEMENT;

  constructor(public payload: CreateInvestmentAgreementPayload) {
  }
}

export class CreateInvestmentAgreementCompleteAction implements Action {
  readonly type = TffActionTypes.CREATE_INVESTMENT_AGREEMENT_COMPLETE;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class CreateInvestmentAgreementFailedAction implements Action {
  readonly type = TffActionTypes.CREATE_INVESTMENT_AGREEMENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetGlobalStatsListAction implements Action {
  readonly type = TffActionTypes.GET_GLOBAL_STATS_LIST;
  payload: null = null;
}

export class GetGlobalStatsListCompleteAction implements Action {
  readonly type = TffActionTypes.GET_GLOBAL_STATS_LIST_COMPLETE;

  constructor(public payload: GlobalStats[]) {
  }
}

export class GetGlobalStatsListFailedAction implements Action {
  readonly type = TffActionTypes.GET_GLOBAL_STATS_LIST_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetGlobalStatsAction implements Action {
  readonly type = TffActionTypes.GET_GLOBAL_STATS;

  constructor(public payload: string) {
  }
}

export class GetGlobalStatsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_GLOBAL_STATS_COMPLETE;

  constructor(public payload: GlobalStats) {
  }
}

export class GetGlobalStatsFailedAction implements Action {
  readonly type = TffActionTypes.GET_GLOBAL_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateGlobalStatsAction implements Action {
  readonly type = TffActionTypes.UPDATE_GLOBAL_STATS;

  constructor(public payload: GlobalStats) {
  }
}

export class UpdateGlobalStatsCompleteAction implements Action {
  readonly type = TffActionTypes.UPDATE_GLOBAL_STATS_COMPLETE;

  constructor(public payload: GlobalStats) {
  }
}

export class UpdateGlobalStatsFailedAction implements Action {
  readonly type = TffActionTypes.UPDATE_GLOBAL_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class SearchUsersAction implements Action {
  readonly type = TffActionTypes.SEARCH_USERS;

  constructor(public payload: SearchUsersQuery) {
  }
}

export class SearchUsersCompleteAction implements Action {
  readonly type = TffActionTypes.SEARCH_USERS_COMPLETE;

  constructor(public payload: UserList) {
  }
}

export class SearchUsersFailedAction implements Action {
  readonly type = TffActionTypes.SEARCH_USERS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetUserAction implements Action {
  readonly type = TffActionTypes.GET_USER;

  constructor(public payload: string) {
  }
}

export class GetUserCompleteAction implements Action {
  readonly type = TffActionTypes.GET_USER_COMPLETE;

  constructor(public payload: Profile) {
  }
}

export class GetUserFailedAction implements Action {
  readonly type = TffActionTypes.GET_USER_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetUserTransactionsAction implements Action {
  readonly type = TffActionTypes.GET_USER_TRANSACTIONS;

  constructor(public payload: string) {
  }
}

export class GetUserTransactionsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_USER_TRANSACTIONS_COMPLETE;

  constructor(public payload: TransactionList) {
  }
}

export class GetUserTransactionsFailedAction implements Action {
  readonly type = TffActionTypes.GET_USER_TRANSACTIONS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetBalanceAction implements Action {
  readonly type = TffActionTypes.GET_BALANCE;

  constructor(public payload: string) {
  }
}

export class GetBalanceCompleteAction implements Action {
  readonly type = TffActionTypes.GET_BALANCE_COMPLETE;

  constructor(public payload: WalletBalance[]) {
  }
}

export class GetBalanceFailedAction implements Action {
  readonly type = TffActionTypes.GET_BALANCE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetNewTransactionAction implements Action {
  readonly type = TffActionTypes.RESET_NEW_TRANSACTION;
  payload: null = null;
}

export class CreateTransactionAction implements Action {
  readonly type = TffActionTypes.CREATE_TRANSACTION;

  constructor(public payload: CreateTransactionPayload) {
  }
}

export class CreateTransactionCompleteAction implements Action {
  readonly type = TffActionTypes.CREATE_TRANSACTION_COMPLETE;

  constructor(public payload: Transaction) {
  }
}

export class CreateTransactionFailedAction implements Action {
  readonly type = TffActionTypes.CREATE_TRANSACTION_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetTffProfileAction implements Action {
  readonly type = TffActionTypes.GET_TFF_PROFILE;

  constructor(public payload: string) {
  }
}

export class GetTffProfileCompleteAction implements Action {
  readonly type = TffActionTypes.GET_TFF_PROFILE_COMPLETE;

  constructor(public payload: TffProfile) {
  }
}

export class GetTffProfileFailedAction implements Action {
  readonly type = TffActionTypes.GET_TFF_PROFILE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class SetKYCStatusAction implements Action {
  readonly type = TffActionTypes.SET_KYC_STATUS;

  constructor(public username: string, public payload: SetKYCStatusPayload) {

  }
}


export class SetKYCStatusCompleteAction implements Action {
  readonly type = TffActionTypes.SET_KYC_STATUS_COMPLETE;

  constructor(public payload: TffProfile) {

  }
}

export class SetKYCStatusFailedAction implements Action {
  readonly type = TffActionTypes.SET_KYC_STATUS_FAILED;

  constructor(public payload: ApiRequestStatus) {

  }
}

export class VerityUtilityBillAction implements Action {
  readonly type = TffActionTypes.VERIFY_UTILITY_BILL;

  constructor(public username: string) {

  }
}

export class VerityUtilityBillCompleteAction implements Action {
  readonly type = TffActionTypes.VERIFY_UTILITY_BILL_COMPLETE;

  constructor(public payload: TffProfile) {

  }
}

export class VerityUtilityBillFailedAction implements Action {
  readonly type = TffActionTypes.VERIFY_UTILITY_BILL_FAILED;

  constructor(public payload: ApiRequestStatus) {

  }
}

export class GetAgendaEventsAction implements Action {
  readonly type = TffActionTypes.GET_AGENDA_EVENTS;

  constructor(public payload: boolean) {
  }
}

export class GetAgendaEventsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_AGENDA_EVENTS_COMPLETE;

  constructor(public payload: AgendaEvent[]) {
  }
}

export class GetAgendaEventsFailedAction implements Action {
  readonly type = TffActionTypes.GET_AGENDA_EVENTS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetAgendaEventAction implements Action {
  readonly type = TffActionTypes.GET_AGENDA_EVENT;

  constructor(public payload: number) {
  }
}

export class GetAgendaEventCompleteAction implements Action {
  readonly type = TffActionTypes.GET_AGENDA_EVENT_COMPLETE;

  constructor(public payload: AgendaEvent) {
  }
}

export class GetAgendaEventFailedAction implements Action {
  readonly type = TffActionTypes.GET_AGENDA_EVENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class ResetAgendaEventAction implements Action {
  readonly type = TffActionTypes.RESET_AGENDA_EVENT;
}


export class CreateAgendaEventAction implements Action {
  readonly type = TffActionTypes.CREATE_AGENDA_EVENT;

  constructor(public payload: AgendaEvent) {
  }
}

export class CreateAgendaEventCompleteAction implements Action {
  readonly type = TffActionTypes.CREATE_AGENDA_EVENT_COMPLETE;

  constructor(public payload: AgendaEvent) {
  }
}

export class CreateAgendaEventFailedAction implements Action {
  readonly type = TffActionTypes.CREATE_AGENDA_EVENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateAgendaEventAction implements Action {
  readonly type = TffActionTypes.UPDATE_AGENDA_EVENT;

  constructor(public payload: AgendaEvent) {
  }
}

export class UpdateAgendaEventCompleteAction implements Action {
  readonly type = TffActionTypes.UPDATE_AGENDA_EVENT_COMPLETE;

  constructor(public payload: AgendaEvent) {
  }
}

export class UpdateAgendaEventFailedAction implements Action {
  readonly type = TffActionTypes.UPDATE_AGENDA_EVENT_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetEventParticipantsAction implements Action {
  readonly type = TffActionTypes.GET_EVENT_PARTICIPANTS;

  constructor(public payload: GetEventParticipantsPayload) {
  }
}

export class GetEventParticipantsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_EVENT_PARTICIPANTS_COMPLETE;

  constructor(public payload: PaginatedResult<EventParticipant>) {
  }
}

export class GetEventParticipantsFailedAction implements Action {
  readonly type = TffActionTypes.GET_EVENT_PARTICIPANTS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetKYCChecksAction implements Action {
  readonly type = TffActionTypes.GET_KYC_CHECKS;

  constructor(public payload: string) {
  }
}

export class GetKYCChecksCompleteAction implements Action {
  readonly type = TffActionTypes.GET_KYC_CHECKS_COMPLETE;

  constructor(public payload: Check[]) {
  }
}

export class GetKYCChecksFailedAction implements Action {
  readonly type = TffActionTypes.GET_KYC_CHECKS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetUserFlowRunsAction implements Action {
  readonly type = TffActionTypes.GET_USER_FLOW_RUNS;

  constructor(public payload: UserFlowRunsQuery) {
  }
}

export class GetUserFlowRunsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_USER_FLOW_RUNS_COMPLETE;

  constructor(public payload: FlowRunList) {
  }
}

export class GetUserFlowRunsFailedAction implements Action {
  readonly type = TffActionTypes.GET_USER_FLOW_RUNS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetFlowRunFlowsAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUN_FLOWS;
}

export class GetFlowRunFlowsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUN_FLOWS_COMPLETE;

  constructor(public payload: string[]) {
  }
}

export class GetFlowRunFlowsFailedAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUN_FLOWS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetFlowRunsAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUNS;

  constructor(public payload: FlowRunQuery) {

  }
}

export class GetFlowRunsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUNS_COMPLETE;

  constructor(public payload: FlowRunList) {
  }
}

export class GetFlowRunsFailedAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUNS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetFlowRunAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUN;

  constructor(public payload: string) {

  }
}

export class GetFlowRunCompleteAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUN_COMPLETE;

  constructor(public payload: FlowRun) {
  }
}

export class GetFlowRunFailedAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_RUN_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetFlowStatsAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_STATS;

  constructor(public payload: string) {

  }
}

export class GetFlowStatsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_STATS_COMPLETE;

  constructor(public payload: FirebaseFlowStats[]) {
  }
}

export class GetFlowStatsFailedAction implements Action {
  readonly type = TffActionTypes.GET_FLOW_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetInstallationsAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATIONS;

  constructor(public payload: GetInstallationsQuery) {
  }
}

export class GetInstallationsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATIONS_COMPLETE;

  constructor(public payload: InstallationsList) {
  }
}

export class GetInstallationsFailedAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATIONS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetInstallationAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATION;

  constructor(public payload: string) {
  }
}

export class GetInstallationCompleteAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATION_COMPLETE;

  constructor(public payload: Installation) {
  }
}

export class GetInstallationFailedAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATION_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetInstallationLogsAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATION_LOGS;

  constructor(public payload: string) {
  }
}

export class GetInstallationLogsCompleteAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATION_LOGS_COMPLETE;

  constructor(public payload: InstallationLog[]) {
  }
}

export class GetInstallationLogsFailedAction implements Action {
  readonly type = TffActionTypes.GET_INSTALLATION_LOGS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetNodesAction implements Action {
  readonly type = TffActionTypes.GET_NODES;

  constructor(public payload: NodesQuery) {
  }
}

export class GetNodesCompleteAction implements Action {
  readonly type = TffActionTypes.GET_NODES_COMPLETE;

  constructor(public payload: UserNodeStatus[]) {
  }
}

export class GetNodesFailedAction implements Action {
  readonly type = TffActionTypes.GET_NODES_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetNodeAction implements Action {
  readonly type = TffActionTypes.GET_NODE;

  constructor(public payload: string) {
  }
}

export class GetNodeCompleteAction implements Action {
  readonly type = TffActionTypes.GET_NODE_COMPLETE;

  constructor(public payload: NodeInfo) {
  }
}

export class GetNodeFailedAction implements Action {
  readonly type = TffActionTypes.GET_NODE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateNodeAction implements Action {
  readonly type = TffActionTypes.UPDATE_NODE;

  constructor(public id: string, public payload: UpdateNodePayload) {
  }
}

export class UpdateNodeCompleteAction implements Action {
  readonly type = TffActionTypes.UPDATE_NODE_COMPLETE;

  constructor(public payload: NodeInfo) {
  }
}

export class UpdateNodeFailedAction implements Action {
  readonly type = TffActionTypes.UPDATE_NODE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class DeleteNodeAction implements Action {
  readonly type = TffActionTypes.DELETE_NODE;

  constructor(public payload: NodeInfo) {
  }
}

export class DeleteNodeCompleteAction implements Action {
  readonly type = TffActionTypes.DELETE_NODE_COMPLETE;

  constructor(public payload: NodeInfo) {
  }
}

export class DeleteNodeFailedAction implements Action {
  readonly type = TffActionTypes.DELETE_NODE_FAILED;

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
  | CreateOrderAction
  | CreateOrderCompleteAction
  | CreateOrderFailedAction
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
  | CreateInvestmentAgreementAction
  | CreateInvestmentAgreementCompleteAction
  | CreateInvestmentAgreementFailedAction
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
  | GetTffProfileAction
  | GetTffProfileCompleteAction
  | GetTffProfileFailedAction
  | SetKYCStatusAction
  | SetKYCStatusCompleteAction
  | SetKYCStatusFailedAction
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
  | GetEventParticipantsFailedAction
  | GetKYCChecksAction
  | GetKYCChecksCompleteAction
  | GetKYCChecksFailedAction
  | GetUserFlowRunsAction
  | GetUserFlowRunsCompleteAction
  | GetUserFlowRunsFailedAction
  | VerityUtilityBillAction
  | VerityUtilityBillCompleteAction
  | VerityUtilityBillFailedAction
  | GetFlowRunFlowsAction
  | GetFlowRunFlowsCompleteAction
  | GetFlowRunFlowsFailedAction
  | GetFlowRunsAction
  | GetFlowRunsCompleteAction
  | GetFlowRunsFailedAction
  | GetFlowRunAction
  | GetFlowRunCompleteAction
  | GetFlowRunFailedAction
  | GetFlowStatsAction
  | GetFlowStatsCompleteAction
  | GetFlowStatsFailedAction
  | GetInstallationsAction
  | GetInstallationsCompleteAction
  | GetInstallationsFailedAction
  | GetInstallationAction
  | GetInstallationCompleteAction
  | GetInstallationFailedAction
  | GetInstallationLogsAction
  | GetInstallationLogsCompleteAction
  | GetInstallationLogsFailedAction
  | GetNodesAction
  | GetNodesCompleteAction
  | GetNodeFailedAction
  | GetNodeAction
  | GetNodeCompleteAction
  | GetNodesFailedAction
  | UpdateNodeAction
  | UpdateNodeCompleteAction
  | UpdateNodeFailedAction
  | DeleteNodeAction
  | DeleteNodeCompleteAction
  | DeleteNodeFailedAction;
