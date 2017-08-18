import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import { ApiErrorResponse } from '../../sample/interfaces/rpc.interfaces';
import { NodeOrder } from '../interfaces/index';

const category = '[TFF]';

export const TffActionTypes = {
  GET_ORDERS: type(`${category} Get orders`),
  GET_ORDERS_COMPLETE: type(`${category} Get orders success `),
  GET_ORDERS_FAILED: type(`${category} Get orders failed`),
};

export class GetOrdersAction implements Action {
  type = TffActionTypes.GET_ORDERS;
  payload: null = null;
}

export class GetOrdersCompleteAction implements Action {
  type = TffActionTypes.GET_ORDERS_COMPLETE;

  constructor(public payload: NodeOrder[]) {
  }
}

export class GetOrdersFailedAction implements Action {
  type = TffActionTypes.GET_ORDERS_FAILED;

  constructor(public payload: ApiErrorResponse) {
  }
}

export type TffActions
  = GetOrdersAction
  | GetOrdersCompleteAction
  | GetOrdersFailedAction;
