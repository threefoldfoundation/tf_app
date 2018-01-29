import { createSelector } from '@ngrx/store';
import { IAppState } from '../app/app.state';
import { AgendaEvent, EventPresence } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { KYCStatus } from '../interfaces/rogerthat';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { TodoList } from '../interfaces/todo-list.interfaces';
import { getServiceData, getUserData } from './rogerthat.state';

export interface IBrandingState {
  globalStats: GlobalStats[];
  globalStatsStatus: ApiRequestStatus;
  todoLists: TodoList[];
  seeDocuments: SeeDocument[];
  seeDocumentsStatus: ApiRequestStatus;
  setReferrerResult: string | null;
  setReferrerStatus: ApiRequestStatus;
  events: AgendaEvent[];
  eventPresence: EventPresence | null;
  eventPresenceStatus: ApiRequestStatus;
  updateEventPresenceStatus: ApiRequestStatus;
  nodes: NodeInfo[];
  nodesStats: NodeInfo[];
  nodesStatsStatus: ApiRequestStatus;
}

export const getAppState = (state: IAppState) => state.app;

export const initialState: IBrandingState = {
  globalStats: [],
  globalStatsStatus: apiRequestInitial,
  todoLists: [],
  seeDocuments: [],
  seeDocumentsStatus: apiRequestInitial,
  setReferrerResult: null,
  setReferrerStatus: apiRequestInitial,
  events: [],
  eventPresence: null,
  eventPresenceStatus: apiRequestInitial,
  updateEventPresenceStatus: apiRequestInitial,
  nodes: [],
  nodesStats: [],
  nodesStatsStatus: apiRequestInitial,
};

export const getGlobalStats = createSelector(getAppState, s => s.globalStats);
export const getGlobalStatsStatus = createSelector(getAppState, s => s.globalStatsStatus);

export const getTodoLists = createSelector(getAppState, s => s.todoLists);

export const getSeeDocuments = createSelector(getAppState, s => s.seeDocuments);
export const getSeeDocumentsStatus = createSelector(getAppState, s => s.seeDocumentsStatus);

export const getSetReferrerResult = createSelector(getAppState, s => s.setReferrerResult);
export const getSetReferrerStatus = createSelector(getAppState, s => s.setReferrerStatus);

export const getEventPresence = createSelector(getAppState, s => s.eventPresence);
export const getEventPresenceStatus = createSelector(getAppState, s => s.eventPresenceStatus);
export const updateEventPresenceStatus = createSelector(getAppState, s => s.updateEventPresenceStatus);

export const getNodes = createSelector(getUserData, s => s.nodes || []);
export const getNodesStats = createSelector(getAppState, s => s.nodesStats);
export const getNodesStatsStatus = createSelector(getAppState, s => s.nodesStatsStatus);

export const getAgendaEvents = createSelector(getServiceData, data => data.agenda_events || []);
export const hasReferrer = createSelector(getUserData, data => data.has_referrer || false);
export const getKYC = createSelector(getUserData, data => data.kyc || { status: KYCStatus.UNVERIFIED, verified: false });
export const isKYCVerified = createSelector(getKYC, kyc => kyc.verified);
export const getReferrals = createSelector(getUserData, data => data.referrals);
export const getSupportChat = createSelector(getUserData, data => data.support_chat_id);

