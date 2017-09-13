import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { TodoList } from '../interfaces/todo-list.interfaces';
import { IAppState } from '../app/app.state';
import { compose, Store } from '@ngrx/store';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';


export interface IBrandingState {
  globalStats: GlobalStats[];
  globalStatsStatus: ApiRequestStatus;
  todoLists: TodoList[];
  seeDocuments: SeeDocument[];
  seeDocumentsStatus: ApiRequestStatus;
  setReferrerResult: string | null;
  setReferrerStatus: ApiRequestStatus;
}

export function getAppState(state$: Store<IAppState>): Store<IBrandingState> {
  return state$.select(state => state.app);
}

export const initialState: IBrandingState = {
  globalStats: [],
  globalStatsStatus: apiRequestInitial,
  todoLists: [],
  seeDocuments: [],
  seeDocumentsStatus: apiRequestInitial,
  setReferrerResult: null,
  setReferrerStatus: apiRequestInitial,
};

export const getGlobalStats = compose(s$ => s$.select(s => s.globalStats), getAppState);
export const getGlobalStatsStatus = compose(s$ => s$.select(s => s.globalStatsStatus), getAppState);

export const getTodoLists = compose(s$ => s$.select(s => s.todoLists), getAppState);

export const getSeeDocuments = compose(s$ => s$.select(s => s.seeDocuments), getAppState);
export const getSeeDocumentsStatus = compose(s$ => s$.select(s => s.seeDocumentsStatus), getAppState);

export const getSetReferrerResult = compose(s$ => s$.select(s => s.setReferrerResult), getAppState);
export const getSetReferrerStatus = compose(s$ => s$.select(s => s.setReferrerStatus), getAppState);
