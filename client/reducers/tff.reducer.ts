import { initialTffState, ITffState } from '../states/index';
import * as actions from '../actions/threefold.action';
import { UpdateGlobalStatsCompleteAction } from '../actions/threefold.action';
import { GetInvestmentAgreementsPayload, GetNodeOrdersPayload, InvestmentAgreementList, NodeOrderList } from '../interfaces/index';
import { apiRequestLoading, apiRequestSuccess } from '../../../framework/client/rpc/rpc.interfaces';

export function tffReducer(state: ITffState = initialTffState,
                           action: actions.TffActions): ITffState {
  switch (action.type) {
    case actions.TffActionTypes.GET_ORDERS:
      return Object.assign({}, state, {
        ordersStatus: apiRequestLoading,
        orders: (<GetNodeOrdersPayload>action.payload).cursor ? state.orders : initialTffState.orders
      });
    case actions.TffActionTypes.GET_ORDERS_COMPLETE:
      return Object.assign({}, state, {
        orders: {
          cursor: (<NodeOrderList>action.payload).cursor,
          more: (<NodeOrderList>action.payload).more,
          results: state.orders.results.concat((<NodeOrderList>action.payload).results)
        },
        ordersStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.GET_ORDERS_FAILED:
      return Object.assign({}, state, {
        ordersStatus: action.payload,
      });
    case actions.TffActionTypes.RESET_ORDER:
      return Object.assign({}, state, {
        order: null,
      });
    case actions.TffActionTypes.GET_ORDER:
      return Object.assign({}, state, {
        order: initialTffState.order,
        orderStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.GET_ORDER_COMPLETE:
      return Object.assign({}, state, {
        order: action.payload,
        orderStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.GET_ORDER_FAILED:
      return Object.assign({}, state, {
        orderStatus: action.payload,
      });
    case actions.TffActionTypes.UPDATE_ORDER:
      return Object.assign({}, state, {
        updateOrderStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.UPDATE_ORDER_COMPLETE:
      return Object.assign({}, state, {
        order: action.payload,
        updateOrderStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.UPDATE_ORDER_FAILED:
      return Object.assign({}, state, {
        updateOrderStatus: action.payload,
      });
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS:
      return Object.assign({}, state, {
        investmentAgreementsStatus: apiRequestLoading,
        investmentAgreements: (<GetInvestmentAgreementsPayload>action.payload).cursor ? state.investmentAgreements :
          initialTffState.investmentAgreements
      });
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS_COMPLETE:
      return Object.assign({}, state, {
        investmentAgreements: {
          cursor: (<InvestmentAgreementList>action.payload).cursor,
          more: (<InvestmentAgreementList>action.payload).more,
          results: state.investmentAgreements.results.concat((<InvestmentAgreementList>action.payload).results)
        },
        investmentAgreementsStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENTS_FAILED:
      return Object.assign({}, state, {
        investmentAgreementsStatus: action.payload,
      });
    case actions.TffActionTypes.RESET_INVESTMENT_AGREEMENT:
      return Object.assign({}, state, {
        investmentAgreement: null,
      });
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENT:
      return Object.assign({}, state, {
        investmentAgreement: initialTffState.investmentAgreement,
        investmentAgreementStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENT_COMPLETE:
      return Object.assign({}, state, {
        investmentAgreement: action.payload,
        investmentAgreementStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.GET_INVESTMENT_AGREEMENT_FAILED:
      return Object.assign({}, state, {
        investmentAgreementStatus: action.payload,
      });
    case actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT:
      return Object.assign({}, state, {
        updateInvestmentAgreementStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_COMPLETE:
      return Object.assign({}, state, {
        investmentAgreement: action.payload,
        updateInvestmentAgreementStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.UPDATE_INVESTMENT_AGREEMENT_FAILED:
      return Object.assign({}, state, {
        updateInvestmentAgreementStatus: action.payload,
      });
    case actions.TffActionTypes.GET_GLOBAL_STATS_LIST:
      return Object.assign({}, state, {
        globalStatsListStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.GET_GLOBAL_STATS_LIST_COMPLETE:
      return Object.assign({}, state, {
        globalStatsList: action.payload,
        globalStatsListStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.GET_GLOBAL_STATS_LIST_FAILED:
      return Object.assign({}, state, {
        globalStatsListStatus: action.payload,
      });
    case actions.TffActionTypes.RESET_GLOBAL_STATS:
      return Object.assign({}, state, {
        globalStats: null,
      });
    case actions.TffActionTypes.GET_GLOBAL_STATS:
      return Object.assign({}, state, {
        globalStats: initialTffState.globalStats,
        globalStatsStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.GET_GLOBAL_STATS_COMPLETE:
      return Object.assign({}, state, {
        globalStats: action.payload,
        globalStatsStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.GET_GLOBAL_STATS_FAILED:
      return Object.assign({}, state, {
        globalStatsStatus: action.payload,
      });
    case actions.TffActionTypes.UPDATE_GLOBAL_STATS:
      return Object.assign({}, state, {
        updateGlobalStatsStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.UPDATE_GLOBAL_STATS_COMPLETE:
      const updateStatsAction = (<UpdateGlobalStatsCompleteAction>action).payload;
      return Object.assign({}, state, {
        globalStats: action.payload,
        globalStatsList: state.globalStatsList ? [
          ...state.globalStatsList.filter(gs => gs.id !== updateStatsAction.id),
          updateStatsAction
        ] : [],
        updateGlobalStatsStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.UPDATE_GLOBAL_STATS_FAILED:
      return Object.assign({}, state, {
        updateGlobalStatsStatus: action.payload,
      });
    default:
      return state;
  }
}
