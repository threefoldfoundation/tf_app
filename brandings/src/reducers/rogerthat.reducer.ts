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

    case RogerthatActionTypes.SCAN_QR_CODE:
      return {
        ...state,
        qrCodeContent: initialRogerthatState.qrCodeContent,
        qrCodeError: initialRogerthatState.qrCodeError,
      };
    case RogerthatActionTypes.SCAN_QR_CODE_UPDATE:
      return {
        ...state,
        qrCodeContent: action.payload,
        qrCodeError: initialRogerthatState.qrCodeError,
      };
    case RogerthatActionTypes.SCAN_QR_CODE_FAILED:
      return {
        ...state,
        qrCodeError: action.payload,
      };
    case RogerthatActionTypes.GET_ADDRESS:
      return {
        ...state,
        addressStatus: apiRequestLoading,
      };
    case RogerthatActionTypes.GET_ADDRESS_COMPLETE:
      return {
        ...state,
        address: action.payload,
        addressStatus: apiRequestSuccess,
      };
    case RogerthatActionTypes.GET_ADDRESS_FAILED:
      return {
        ...state,
        addressStatus: action.payload,
      };
  }
  return state;
}
