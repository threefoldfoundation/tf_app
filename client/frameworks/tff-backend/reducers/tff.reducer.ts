import { initialTffState, ITffState } from '../states/index';
import * as actions from '../actions/threefold.action';
import { apiRequestLoading, apiRequestSuccess } from '../interfaces/rpc.interfaces';

export function tffReducer(state: ITffState = initialTffState,
                           action: actions.TffActions): ITffState {
  switch (action.type) {
    case actions.TffActionTypes.GET_ORDERS:
      return (<any>Object).assign({}, state, {
        orders: [],
        ordersStatus: apiRequestLoading,
      });
    case actions.TffActionTypes.GET_ORDERS_COMPLETE:
      return (<any>Object).assign({}, state, {
        orders: action.payload,
        ordersStatus: apiRequestSuccess,
      });
    case actions.TffActionTypes.GET_ORDERS_FAILED:
      return (<any>Object).assign({}, state, {
        ordersStatus: action.payload,
      });
    default:
      return state;
  }
}
