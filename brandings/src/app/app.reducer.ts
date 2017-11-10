import { BrandingActions, BrandingActionTypes } from '../actions/branding.actions';
import { EventPresence } from '../interfaces/agenda.interfaces';
import { SetReferralResult } from '../interfaces/referrals.interfaces';
import { apiRequestLoading, apiRequestSuccess } from '../interfaces/rpc.interfaces';
import { IBrandingState, initialState } from '../state/app.state';

export function appReducer(state: IBrandingState = initialState, action: BrandingActions): IBrandingState {
  switch (action.type) {
    case BrandingActionTypes.GET_GLOBAL_STATS:
      return {
        ...state,
        globalStatsStatus: apiRequestLoading
      };
    case BrandingActionTypes.GET_GLOBAL_STATS_COMPLETE:
      return {
        ...state,
        globalStats: action.payload,
        globalStatsStatus: apiRequestSuccess,
      };
    case BrandingActionTypes.GET_GLOBAL_STATS_FAILED:
      return {
        ...state,
        globalStatsStatus: action.payload
      };
    case BrandingActionTypes.GET_SEE_DOCUMENTS:
      return {
        ...state,
        seeDocumentsStatus: apiRequestLoading
      };
    case BrandingActionTypes.GET_SEE_DOCUMENTS_COMPLETE:
      return {
        ...state,
        seeDocuments: action.payload,
        seeDocumentsStatus: apiRequestSuccess,
      };
    case BrandingActionTypes.GET_SEE_DOCUMENTS_FAILED:
      return {
        ...state,
        seeDocumentsStatus: action.payload
      };
    case BrandingActionTypes.SET_REFERRER:
      return {
        ...state,
        setReferrerStatus: apiRequestLoading
      };
    case BrandingActionTypes.SET_REFERRER_COMPLETE:
      return {
        ...state,
        setReferrerResult: (<SetReferralResult>action.payload).result,
        setReferrerStatus: apiRequestSuccess,
      };
    case BrandingActionTypes.SET_REFERRER_FAILED:
      return {
        ...state,
        setReferrerStatus: action.payload
      };
    case BrandingActionTypes.GET_EVENTS:
      return {
        ...state,
        events: initialState.events
      };
    case BrandingActionTypes.GET_EVENTS_COMPLETE:
      return {
        ...state,
        events: action.payload
      };
    case BrandingActionTypes.GET_EVENT_PRESENCE:
      return {
        ...state,
        eventPresenceStatus: apiRequestLoading
      };
    case BrandingActionTypes.GET_EVENT_PRESENCE_COMPLETE:
      return {
        ...state,
        eventPresence: action.payload,
        eventPresenceStatus: apiRequestSuccess
      };
    case BrandingActionTypes.GET_EVENT_PRESENCE_FAILED:
      return {
        ...state,
        eventPresenceStatus: action.payload
      };
    case BrandingActionTypes.UPDATE_EVENT_PRESENCE:
      return {
        ...state,
        updateEventPresenceStatus: apiRequestLoading,
      };
    case BrandingActionTypes.UPDATE_EVENT_PRESENCE_COMPLETE:
      return {
        ...state,
        eventPresence: {
          ...<EventPresence>state.eventPresence,
          ...action.payload
        },
        updateEventPresenceStatus: apiRequestSuccess
      };
    case BrandingActionTypes.UPDATE_EVENT_PRESENCE_FAILED:
      return {
        ...state,
        updateEventPresenceStatus: action.payload
      };
  }
  return state;
}
