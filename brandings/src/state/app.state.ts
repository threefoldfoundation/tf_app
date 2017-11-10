import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AgendaEvent,  EventPresence } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { TodoList } from '../interfaces/todo-list.interfaces';


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
}

export const getAppState = createFeatureSelector<IBrandingState>('app');

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
};

export const getGlobalStats = createSelector(getAppState, s => s.globalStats);
export const getGlobalStatsStatus = createSelector(getAppState, s => s.globalStatsStatus);

export const getTodoLists = createSelector(getAppState, s => s.todoLists);

export const getSeeDocuments = createSelector(getAppState, s => s.seeDocuments);
export const getSeeDocumentsStatus = createSelector(getAppState, s => s.seeDocumentsStatus);

export const getSetReferrerResult = createSelector(getAppState, s => s.setReferrerResult);
export const getSetReferrerStatus = createSelector(getAppState, s => s.setReferrerStatus);

export const getEvents = createSelector(getAppState, s => s.events);
export const getEventPresence = createSelector(getAppState, s => s.eventPresence);
export const getEventPresenceStatus = createSelector(getAppState, s => s.eventPresenceStatus);
export const updateEventPresenceStatus = createSelector(getAppState, s => s.updateEventPresenceStatus);
