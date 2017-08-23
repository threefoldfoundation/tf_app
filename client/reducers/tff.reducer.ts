import { initialTffState, ITffState } from '../states/index';
import * as actions from '../actions/threefold.action';
import { apiRequestLoading, apiRequestSuccess } from '../interfaces/rpc.interfaces';
import { NodeOrderList } from '../interfaces/nodes.interfaces';

export function tffReducer(state: ITffState = initialTffState,
                           action: actions.TffActions): ITffState {
  switch (action.type) {
    case actions.TffActionTypes.GET_ORDERS:
      return Object.assign({}, state, {
        ordersStatus: apiRequestLoading,
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
    default:
      return state;
  }
}
