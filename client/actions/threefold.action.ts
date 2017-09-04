import { Action } from '@ngrx/store';
import { NodeOrder } from '../interfaces/index';
import { type } from '../../../framework/client/core/utils/type';
import { ApiErrorResponse } from '../../../framework/client/sample/interfaces/rpc.interfaces';
import { GetNodeOrdersPayload, NodeOrderList } from '../interfaces/nodes.interfaces';
import {
  GetInvestmentAgreementsPayload,
  InvestmentAgreement,
  InvestmentAgreementList
} from '../interfaces/investment-agreements.interfaces';

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
  GET_INVESTMENT_AGREEMENTS: type(`${category} Get investment agreements`),
  GET_INVESTMENT_AGREEMENTS_COMPLETE: type(`${category} Get investment agreements success `),
  GET_INVESTMENT_AGREEMENTS_FAILED: type(`${category} Get investment agreements failed`),
  RESET_INVESTMENT_AGREEMENT: type(`${category} Reset investment agreement`),
  GET_INVESTMENT_AGREEMENT: type(`${category} Get investment agreement`),
  GET_INVESTMENT_AGREEMENT_COMPLETE: type(`${category} Get investment agreement success `),
  GET_INVESTMENT_AGREEMENT_FAILED: type(`${category} Get investment agreement failed`),
  UPDATE_INVESTMENT_AGREEMENT: type(`${category} Update investment agreement`),
  UPDATE_INVESTMENT_AGREEMENT_COMPLETE: type(`${category} Update investment agreement success `),
  UPDATE_INVESTMENT_AGREEMENT_FAILED: type(`${category} Update investment agreement failed`),
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

export class GetInvestmentAgreementsAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENTS;

  constructor(public payload: GetInvestmentAgreementsPayload) {
  }
}

export class GetInvestmentAgreementsCompleteAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENTS_COMPLETE;

  constructor(public payload: InvestmentAgreementList) {
  }
}

export class GetInvestmentAgreementsFailedAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENTS_FAILED;

  constructor(public payload: ApiErrorResponse) {
  }
}

export class ResetInvestmentAgreementAction implements Action {
  type = TffActionTypes.RESET_INVESTMENT_AGREEMENT;
}

export class GetInvestmentAgreementAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENT;

  constructor(public payload: string) {
  }
}

export class GetInvestmentAgreementCompleteAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENT_COMPLETE;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class GetInvestmentAgreementFailedAction implements Action {
  type = TffActionTypes.GET_INVESTMENT_AGREEMENT_FAILED;

  constructor(public payload: ApiErrorResponse) {
  }
}

export class UpdateInvestmentAgreementAction implements Action {
  type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class UpdateInvestmentAgreementCompleteAction implements Action {
  type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_COMPLETE;

  constructor(public payload: InvestmentAgreement) {
  }
}

export class UpdateInvestmentAgreementFailedAction implements Action {
  type = TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_FAILED;

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
  | UpdateOrderFailedAction
  | GetInvestmentAgreementsAction
  | GetInvestmentAgreementsCompleteAction
  | GetInvestmentAgreementsFailedAction
  | GetInvestmentAgreementAction
  | GetInvestmentAgreementCompleteAction
  | GetInvestmentAgreementFailedAction
  | UpdateInvestmentAgreementAction
  | UpdateInvestmentAgreementCompleteAction
  | UpdateInvestmentAgreementFailedAction;
