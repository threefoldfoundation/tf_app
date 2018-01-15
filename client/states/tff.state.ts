import { apiRequestInitial, ApiRequestStatus } from '../../../framework/client/rpc/rpc.interfaces';
import { Profile } from '../../../its_you_online_auth/client/interfaces/index';
import { AgendaEvent, EventParticipant } from '../interfaces/agenda-events.interfaces';
import {
  FlowRun,
  FlowRunList,
  GlobalStats,
  InvestmentAgreement,
  InvestmentAgreementList,
  InvestmentAgreementsQuery,
  NodeOrder,
  NodeOrderList,
  NodeOrdersQuery,
  PaginatedResult,
  TransactionList,
  WalletBalance,
} from '../interfaces/index';
import { Check } from '../interfaces/onfido.interfaces';
import { SearchUsersQuery, TffProfile, UserList } from '../interfaces/profile.interfaces';

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
  createInvestmentAgreementStatus: ApiRequestStatus;
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
  tffProfile: TffProfile | null;
  tffProfileStatus: ApiRequestStatus;
  setKYCStatus: ApiRequestStatus;
  agendaEvents: AgendaEvent[];
  agendaEventsStatus: ApiRequestStatus;
  agendaEvent: AgendaEvent | null;
  agendaEventStatus: ApiRequestStatus;
  createAgendaEventStatus: ApiRequestStatus;
  updateAgendaEventStatus: ApiRequestStatus;
  eventParticipants: PaginatedResult<EventParticipant>;
  eventParticipantsStatus: ApiRequestStatus;
  kycChecks: Check[];
  kycChecksStatus: ApiRequestStatus;
  distinctFlows: string[];
  distinctFlowsStatus: ApiRequestStatus;
  flowRuns: FlowRunList;
  flowRunsStatus: ApiRequestStatus;
  flowRun: FlowRun | null;
  flowRunStatus: ApiRequestStatus;

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
  createInvestmentAgreementStatus: apiRequestInitial,
  globalStatsList: [],
  globalStatsListStatus: apiRequestInitial,
  globalStats: null,
  globalStatsStatus: apiRequestInitial,
  updateGlobalStatsStatus: apiRequestInitial,
  userListQuery: {
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
  tffProfile: null,
  tffProfileStatus: apiRequestInitial,
  setKYCStatus: apiRequestInitial,
  agendaEvents: [],
  agendaEventsStatus: apiRequestInitial,
  agendaEvent: null,
  agendaEventStatus: apiRequestInitial,
  createAgendaEventStatus: apiRequestInitial,
  updateAgendaEventStatus: apiRequestInitial,
  eventParticipants: emptyPaginatedResult,
  eventParticipantsStatus: apiRequestInitial,
  kycChecks: [],
  kycChecksStatus: apiRequestInitial,
  distinctFlows: [],
  distinctFlowsStatus: apiRequestInitial,
  flowRuns: emptyPaginatedResult,
  flowRunsStatus: apiRequestInitial,
  flowRun: null,
  flowRunStatus: apiRequestInitial,
};
