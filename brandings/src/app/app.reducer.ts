import { IBrandingState, initialState } from '../state/app.state';
import { BrandingActions, BrandingActionTypes } from '../actions/branding.actions';
import { apiRequestLoading, apiRequestSuccess } from '../interfaces/rpc.interfaces';
import { SetReferralResult } from '../interfaces/referrals.interfaces';

export function appReducer(state: IBrandingState = initialState, action: BrandingActions): IBrandingState {
  switch (action.type) {
    case BrandingActionTypes.GET_GLOBAL_STATS:
      state = Object.assign({}, state, {
        globalStatsStatus: apiRequestLoading
      });
      break;
    case BrandingActionTypes.GET_GLOBAL_STATS_COMPLETE:
      state = Object.assign({}, state, {
        globalStats: action.payload,
        globalStatsStatus: apiRequestSuccess,
      });
      break;
    case BrandingActionTypes.GET_GLOBAL_STATS_FAILED:
      state = Object.assign({}, state, {
        globalStatsStatus: action.payload
      });
      break;
    case BrandingActionTypes.GET_SEE_DOCUMENTS:
      state = Object.assign({}, state, {
        seeDocumentsStatus: apiRequestLoading
      });
      break;
    case BrandingActionTypes.GET_SEE_DOCUMENTS_COMPLETE:
      state = Object.assign({}, state, {
        seeDocuments: action.payload,
        seeDocumentsStatus: apiRequestSuccess,
      });
      break;
    case BrandingActionTypes.GET_SEE_DOCUMENTS_FAILED:
      state = Object.assign({}, state, {
        seeDocumentsStatus: action.payload
      });
      break;
    case BrandingActionTypes.SET_REFERRER:
      state = Object.assign({}, state, {
        setReferrerStatus: apiRequestLoading
      });
      break;
    case BrandingActionTypes.SET_REFERRER_COMPLETE:
      state = Object.assign({}, state, {
        setReferrerResult: (<SetReferralResult>action.payload).result,
        setReferrerStatus: apiRequestSuccess,
      });
      break;
    case BrandingActionTypes.SET_REFERRER_FAILED:
      state = Object.assign({}, state, {
        setReferrerStatus: action.payload
      });
      break;
  }
  return state;
}
