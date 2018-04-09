import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AgendaEvent, EventPresence } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { NodeInfo, NodeStatus } from '../interfaces/node-status.interfaces';
import { KYCStatus } from '../interfaces/rogerthat';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { TodoList } from '../interfaces/todo-list.interfaces';
import { ParsedTransaction, RivineBlock, RivineCreateTransactionResult } from '../interfaces/wallet';
import { CryptoTransaction } from '../manual_typings/rogerthat';
import { getServiceData, getUserData } from './rogerthat.state';

export interface IBrandingState {
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
}

export const getAppState = createFeatureSelector<IBrandingState>('app');

export const initialState: IBrandingState = {
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
};

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

export const getAgendaEvents = createSelector(getServiceData, data => data.agenda_events || []);
export const hasReferrer = createSelector(getUserData, data => data.has_referrer || false);
export const getKYC = createSelector(getUserData, data => data.kyc || { status: KYCStatus.UNVERIFIED, verified: false });
export const isKYCVerified = createSelector(getKYC, kyc => kyc.verified);
export const getReferrals = createSelector(getUserData, data => data.referrals);
export const getSupportChat = createSelector(getUserData, data => data.support_chat_id);
export const getUserDataNodeStatus = createSelector(getUserData, data => (data.nodes || []).map((node: NodeInfo) => ({
  ...node,
  status: node.status || NodeStatus.HALTED,
})));
