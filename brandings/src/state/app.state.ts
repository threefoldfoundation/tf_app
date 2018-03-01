import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AgendaEvent, EventPresence } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { TodoList } from '../interfaces/todo-list.interfaces';
import { ParsedTransaction } from '../interfaces/wallet';
import { CryptoAddress, CryptoTransaction, QrCodeScannedContent } from '../manual_typings/rogerthat';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { ApiCallResult } from '../services/rogerthat.service';

export interface IBrandingState {
  apiCallResult: ApiCallResult | null;
  qrCodeContent: QrCodeScannedContent | null;
  qrCodeError: RogerthatError | null;
  globalStats: GlobalStats[];
  globalStatsStatus: ApiRequestStatus;
  todoLists: TodoList[];
  seeDocuments: SeeDocument[];
  seeDocumentsStatus: ApiRequestStatus;
  events: AgendaEvent[];
  eventPresence: EventPresence | null;
  eventPresenceStatus: ApiRequestStatus;
  updateEventPresenceStatus: ApiRequestStatus;
  nodes: NodeInfo[];
  nodesStatus: ApiRequestStatus;
  transactions: ParsedTransaction[];
  transactionsStatus: ApiRequestStatus;
  address: CryptoAddress | null;
  addressStatus: ApiRequestStatus<RogerthatError>;
  pendingTransaction: CryptoTransaction | null;
  pendingTransactionStatus: ApiRequestStatus;
  createTransactionStatus: ApiRequestStatus;
}

export const getAppState = createFeatureSelector<IBrandingState>('app');

export const initialState: IBrandingState = {
  apiCallResult: null,
  qrCodeContent: null,
  qrCodeError: null,
  globalStats: [],
  globalStatsStatus: apiRequestInitial,
  todoLists: [],
  seeDocuments: [],
  seeDocumentsStatus: apiRequestInitial,
  events: [],
  eventPresence: null,
  eventPresenceStatus: apiRequestInitial,
  updateEventPresenceStatus: apiRequestInitial,
  nodes: [],
  nodesStatus: apiRequestInitial,
  transactions: [],
  transactionsStatus: apiRequestInitial,
  address: null,
  addressStatus: apiRequestInitial,
  pendingTransaction: null,
  pendingTransactionStatus: apiRequestInitial,
  createTransactionStatus: apiRequestInitial,
};

export const getApicallResult = createSelector(getAppState, s => s.apiCallResult);
export const getQrCodeContent = createSelector(getAppState, s => s.qrCodeContent);
export const getQrCodeError = createSelector(getAppState, s => s.qrCodeError);

export const getGlobalStats = createSelector(getAppState, s => s.globalStats);
export const getGlobalStatsStatus = createSelector(getAppState, s => s.globalStatsStatus);

export const getTodoLists = createSelector(getAppState, s => s.todoLists);

export const getSeeDocuments = createSelector(getAppState, s => s.seeDocuments);
export const getSeeDocumentsStatus = createSelector(getAppState, s => s.seeDocumentsStatus);

export const getEvents = createSelector(getAppState, s => s.events);
export const getEventPresence = createSelector(getAppState, s => s.eventPresence);
export const getEventPresenceStatus = createSelector(getAppState, s => s.eventPresenceStatus);
export const updateEventPresenceStatus = createSelector(getAppState, s => s.updateEventPresenceStatus);

export const getNodes = createSelector(getAppState, s => s.nodes);
export const getNodesStatus = createSelector(getAppState, s => s.nodesStatus);

export const getTransactions = createSelector(getAppState, s => s.transactions);
export const getTotalAmount = createSelector(getTransactions, transactions => {
  return transactions.reduce((total: number, transaction: ParsedTransaction) => total + transaction.amount, 0);
});
export const getTransactionsStatus = createSelector(getAppState, s => s.transactionsStatus);

export const getAddress = createSelector(getAppState, s => s.address);
export const getAddressStatus = createSelector(getAppState, s => s.addressStatus);

export const getPendingTransaction = createSelector(getAppState, s => s.pendingTransaction);
export const getPendingTransactionStatus = createSelector(getAppState, s => s.pendingTransactionStatus);
export const createTransactionStatus = createSelector(getAppState, s => s.createTransactionStatus);
