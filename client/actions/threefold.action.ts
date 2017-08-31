import { Action } from '@ngrx/store';
import { NodeOrder } from '../interfaces/index';
import { type } from '../../../framework/client/core/utils/type';
import { ApiErrorResponse } from '../../../framework/client/sample/interfaces/rpc.interfaces';
import { GetNodeOrdersPayload, NodeOrderList } from '../interfaces/nodes.interfaces';

const category = '[TFF]';

export const TffActionTypes = {
  GET_ORDERS: type(`${category} Get orders`),
  GET_ORDERS_COMPLETE: type(`${category} Get orders success `),
  GET_ORDERS_FAILED: type(`${category} Get orders failed`),
  RESET_ORDER: type(`${category} Reset order`),
  GET_ORDER: type(`${category} Get order`),
  GET_ORDER_COMPLETE: type(`${category} Get order success `),
  GET_ORDER_FAILED: type(`${category} Get order failed`),
  UPDATE_ORDER: type(`${category} Update order`),
  UPDATE_ORDER_COMPLETE: type(`${category} Update order success `),
  UPDATE_ORDER_FAILED: type(`${category} Update order failed`),
};

export class GetOrdersAction implements Action {
  type = TffActionTypes.GET_ORDERS;

  constructor(public payload: GetNodeOrdersPayload) {
  }
}

export class GetOrdersCompleteAction implements Action {
  type = TffActionTypes.GET_ORDERS_COMPLETE;

  constructor(public payload: NodeOrderList) {
  }
}

export class GetOrdersFailedAction implements Action {
  type = TffActionTypes.GET_ORDERS_FAILED;

  constructor(public payload: ApiErrorResponse) {
  }
}

export class ResetNodeOrderAction implements Action {
  type = TffActionTypes.RESET_ORDER;
  payload: null = null;
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

  constructor(public payload: ApiErrorResponse) {
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

  constructor(public payload: ApiErrorResponse) {
  }
}

export type TffActions
  = GetOrdersAction
  | GetOrdersCompleteAction
  | GetOrdersFailedAction
  | GetOrderAction
  | GetOrderCompleteAction
  | GetOrderFailedAction
  | UpdateOrderAction
  | UpdateOrderCompleteAction
  | UpdateOrderFailedAction;
