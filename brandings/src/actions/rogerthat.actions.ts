import { Action } from '@ngrx/store';
import { ServiceData, UserData } from '../interfaces/rogerthat';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { ListNewsItemsParams, ListNewsItemsResult } from '../manual_typings/rogerthat';
import { ApiCallResult } from '../services/rogerthat.service';

interface IRogerthatActionTypes {
  API_CALL: 'Api call';
  API_CALL_COMPLETE: 'Api call complete';
  SET_USER_DATA: 'Set user data';
  SET_SERVICE_DATA: 'Set service data';
  LIST_NEWS: 'List news';
  LIST_NEWS_COMPLETE: 'List news complete';
  LIST_NEWS_FAILED: 'List news failed';
}

export const RogerthatActionTypes: IRogerthatActionTypes = {
  API_CALL: 'Api call',
  API_CALL_COMPLETE: 'Api call complete',
  SET_USER_DATA: 'Set user data',
  SET_SERVICE_DATA: 'Set service data',
  LIST_NEWS: 'List news',
  LIST_NEWS_COMPLETE: 'List news complete',
  LIST_NEWS_FAILED: 'List news failed',
};

export class ApiCallAction implements Action {
  type = RogerthatActionTypes.API_CALL;

  constructor(public method: string, public data?: any, public tag?: string | null) {
  }
}

export class ApiCallCompleteAction implements Action {
  type = RogerthatActionTypes.API_CALL_COMPLETE;

  constructor(public payload: ApiCallResult) {
  }
}

export class SetUserDataAction implements Action {
  type = RogerthatActionTypes.SET_USER_DATA;

  constructor(public payload: UserData) {
  }
}

export class SetServiceDataAction implements Action {
  type = RogerthatActionTypes.SET_SERVICE_DATA;

  constructor(public payload: ServiceData) {
  }
}

export class ListNewsAction implements Action {
  type = RogerthatActionTypes.LIST_NEWS;

  constructor(public payload: ListNewsItemsParams) {
  }
}

export class ListNewsCompleteAction implements Action {
  type = RogerthatActionTypes.LIST_NEWS_COMPLETE;

  constructor(public payload: ListNewsItemsResult) {
  }
}

export class ListNewsFailedAction implements Action {
  type = RogerthatActionTypes.LIST_NEWS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export type RogerthatActions
  = ApiCallAction
  | ApiCallCompleteAction
  | SetUserDataAction
  | SetServiceDataAction
  | ListNewsAction
  | ListNewsCompleteAction
  | ListNewsFailedAction;

