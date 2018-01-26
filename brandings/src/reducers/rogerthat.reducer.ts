import { RogerthatActions, RogerthatActionTypes } from '../actions';
import { apiRequestLoading, apiRequestSuccess } from '../interfaces/rpc.interfaces';
import { initialRogerthatState, IRogerthatState } from '../state/rogerthat.state';

export function rogerthatReducer(state: IRogerthatState = initialRogerthatState, action: RogerthatActions): IRogerthatState {
  switch (action.type) {
    case RogerthatActionTypes.API_CALL_COMPLETE:
      return {
        ...state,
        apiCallResult: { ...action.payload },
      };
    case RogerthatActionTypes.SET_USER_DATA:
      return {
        ...state,
        userData: action.payload,
      };
    case RogerthatActionTypes.SET_SERVICE_DATA:
      return {
        ...state,
        serviceData: action.payload,
      };
    case RogerthatActionTypes.LIST_NEWS:
      return {
        ...state,
        newsItemList: action.payload.cursor ? state.newsItemList : initialRogerthatState.newsItemList,
        newsItemListStatus: apiRequestLoading,
      };
    case RogerthatActionTypes.LIST_NEWS_COMPLETE:
      return {
        ...state,
        newsItemList: { ...action.payload, items: [ ...state.newsItemList.items, ...action.payload.items ] },
        newsItemListStatus: apiRequestSuccess,
      };
    case RogerthatActionTypes.LIST_NEWS_FAILED:
      return {
        ...state,
        newsItemListStatus: action.payload,
      };
  }
  return state;
}
