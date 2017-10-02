import { initialTffState, ITffState } from '../states/index';
import * as actions from '../actions/threefold.action';
import { GetOrderCompleteAction } from '../actions/threefold.action';
import { GetInvestmentAgreementsPayload, GetNodeOrdersPayload, InvestmentAgreementList, NodeOrderList } from '../interfaces/index';
import { apiRequestLoading, apiRequestSuccess } from '../../../framework/client/rpc/rpc.interfaces';

export function tffReducer(state: ITffState = initialTffState,
                           action: actions.TffActions): ITffState {
  switch (action.type) {
    case actions.TffActionTypes.GET_ORDERS:
      return {
        ...state,
        ordersStatus: apiRequestLoading,
        orders: (<GetNodeOrdersPayload>action.payload).cursor ? state.orders : initialTffState.orders,
        ordersType: (<GetNodeOrdersPayload>action.payload).status,
      };
    case actions.TffActionTypes.GET_ORDERS_COMPLETE:
      return {
        ...state,
        orders: {
          cursor: (<NodeOrderList>action.payload).cursor,
          more: (<NodeOrderList>action.payload).more,
          results: [ ...state.orders.results, ...(<NodeOrderList>action.payload).results ],
        },
        ordersStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.GET_ORDERS_FAILED:
      return {
        ...state,
        ordersStatus: (<actions.GetOrdersFailedAction>action).payload,
      };
    case actions.TffActionTypes.RESET_ORDER:
      return {
        ...state,
        order: null,
      };
    case actions.TffActionTypes.GET_ORDER:
      return {
        ...state,
        order: initialTffState.order,
        orderStatus: apiRequestLoading,
      };
    case actions.TffActionTypes.GET_ORDER_COMPLETE:
      return {
        ...state,
        order: (<GetOrderCompleteAction>action).payload,
        orderStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.GET_ORDER_FAILED:
      return {
        ...state,
        orderStatus: (<actions.GetOrderFailedAction>action).payload,
      };
    case actions.TffActionTypes.UPDATE_ORDER:
      return {
        ...state,
        updateOrderStatus: apiRequestLoading,
      };
    case actions.TffActionTypes.UPDATE_ORDER_COMPLETE:
      return {
        ...state,
        order: (<actions.UpdateOrderCompleteAction>action).payload,
        updateOrderStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.UPDATE_ORDER_FAILED:
      return {
        ...state,
        updateOrderStatus: (<actions.UpdateOrderFailedAction>action).payload,
      };
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS:
      return {
        ...state,
        investmentAgreementsStatus: apiRequestLoading,
        investmentAgreementsType: (<GetInvestmentAgreementsPayload>action.payload).status,
        investmentAgreements: (<GetInvestmentAgreementsPayload>action.payload).cursor ? state.investmentAgreements :
          initialTffState.investmentAgreements,
      };
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS_COMPLETE:
      return {
        ...state,
        investmentAgreements: {
          cursor: (<InvestmentAgreementList>action.payload).cursor,
          more: (<InvestmentAgreementList>action.payload).more,
          results: state.investmentAgreements.results.concat((<InvestmentAgreementList>action.payload).results)
        },
        investmentAgreementsStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS_FAILED:
      return {
        ...state,
        investmentAgreementsStatus: (<actions.GetInvestmentAgreementsFailedAction>action).payload,
      };
    case actions.TffActionTypes.RESET_INVESTMENT_AGREEMENT:
      return {
        ...state,
        investmentAgreement: null,
      };
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENT:
      return {
        ...state,
        investmentAgreement: initialTffState.investmentAgreement,
        investmentAgreementStatus: apiRequestLoading,
      };
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENT_COMPLETE:
      return {
        ...state,
        investmentAgreement: (<actions.GetInvestmentAgreementCompleteAction>action).payload,
        investmentAgreementStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENT_FAILED:
      return {
        ...state,
        investmentAgreementStatus: (<actions.GetInvestmentAgreementsFailedAction>action).payload,
      };
    case actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT:
      return {
        ...state,
        updateInvestmentAgreementStatus: apiRequestLoading,
      };
    case actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_COMPLETE:
      return {
        ...state,
        investmentAgreement: (<actions.UpdateInvestmentAgreementCompleteAction>action).payload,
        updateInvestmentAgreementStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_FAILED:
      return {
        ...state,
        updateInvestmentAgreementStatus: (<actions.UpdateInvestmentAgreementFailedAction>action).payload,
      };
    case actions.TffActionTypes.GET_GLOBAL_STATS_LIST:
      return {
        ...state,
        globalStatsListStatus: apiRequestLoading,

      };
    case actions.TffActionTypes.GET_GLOBAL_STATS_LIST_COMPLETE:
      return {
        ...state,
        globalStatsList: (<actions.GetGlobalStatsListCompleteAction>action).payload,
        globalStatsListStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.GET_GLOBAL_STATS_LIST_FAILED:
      return {
        ...state,
        globalStatsListStatus: (<actions.GetGlobalStatsListFailedAction>action).payload,
      };
    case actions.TffActionTypes.RESET_GLOBAL_STATS:
      return {
        ...state,
        globalStats: null,
      };
    case actions.TffActionTypes.GET_GLOBAL_STATS:
      return {
        ...state,
        globalStats: initialTffState.globalStats,
        globalStatsStatus: apiRequestLoading,
      };
    case actions.TffActionTypes.GET_GLOBAL_STATS_COMPLETE:
      return {
        ...state,
        globalStats: (<actions.GetGlobalStatsCompleteAction>action).payload,
        globalStatsStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.GET_GLOBAL_STATS_FAILED:
      return {
        ...state,
        globalStatsStatus: (<actions.GetGlobalStatsFailedAction>action).payload,
      };
    case actions.TffActionTypes.UPDATE_GLOBAL_STATS:
      return {
        ...state,
        updateGlobalStatsStatus: apiRequestLoading,
      };
    case actions.TffActionTypes.UPDATE_GLOBAL_STATS_COMPLETE:
      const updateStatsAction = (<actions.UpdateGlobalStatsCompleteAction>action).payload;
      return {
        ...state,
        globalStats: (<actions.UpdateGlobalStatsCompleteAction>action).payload,
        globalStatsList: state.globalStatsList ? [
          ...state.globalStatsList.filter(gs => gs.id !== updateStatsAction.id),
          updateStatsAction
        ] : [],
        updateGlobalStatsStatus: apiRequestSuccess,
      };
    case actions.TffActionTypes.UPDATE_GLOBAL_STATS_FAILED:
      return {
        ...state,
        updateGlobalStatsStatus: (<actions.UpdateGlobalStatsFailedAction>action).payload,
      };
    default:
      return state;
  }
}
