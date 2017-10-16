import { Action } from '@ngrx/store';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { SetReferralResult } from '../interfaces/referrals.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { ApiCallResult } from '../services/rogerthat.service';


export const BrandingActionTypes = {
  GET_GLOBAL_STATS: 'Get global stats',
  GET_GLOBAL_STATS_COMPLETE: 'Get global stats complete',
  GET_GLOBAL_STATS_FAILED: 'Get global stats failed',
  GET_SEE_DOCUMENTS: 'Get see documents ',
  GET_SEE_DOCUMENTS_COMPLETE: 'Get see documents complete',
  GET_SEE_DOCUMENTS_FAILED: 'Get see documents failed',
  SET_REFERRER: 'Set referrer',
  SET_REFERRER_COMPLETE: 'Set referrer complete',
  SET_REFERRER_FAILED: 'Set referrer failed',
};

export class GetGlobalStatsAction implements Action {
  type = BrandingActionTypes.GET_GLOBAL_STATS;
  payload: null = null;
}

export class GetGlobalStatsCompleteAction implements Action {
  type = BrandingActionTypes.GET_GLOBAL_STATS_COMPLETE;

  constructor(public payload: GlobalStats[]) {
  }
}

export class GetGlobalStatsFailedAction implements Action {
  type = BrandingActionTypes.GET_GLOBAL_STATS_FAILED;

  constructor(public payload: ApiCallResult) {
  }
}

export class GetSeeDocumentsAction implements Action {
  type = BrandingActionTypes.GET_SEE_DOCUMENTS;
  payload: null = null;
}

export class GetSeeDocumentsCompleteAction implements Action {
  type = BrandingActionTypes.GET_SEE_DOCUMENTS_COMPLETE;

  constructor(public payload: SeeDocument[]) {
  }
}

export class GetSeeDocumentsFailedAction implements Action {
  type = BrandingActionTypes.GET_SEE_DOCUMENTS_FAILED;

  constructor(public payload: ApiCallResult) {
  }
}

export class SetReferrerAction implements Action {
  type = BrandingActionTypes.SET_REFERRER;

  constructor(public payload: string) {
  }
}

export class SetReferrerCompleteAction implements Action {
  type = BrandingActionTypes.SET_REFERRER_COMPLETE;

  constructor(public payload: SetReferralResult) {
  }
}

export class SetReferrerFailedAction implements Action {
  type = BrandingActionTypes.SET_REFERRER_FAILED;

  constructor(public payload: ApiCallResult) {
  }
}

export type BrandingActions
  = GetGlobalStatsAction
  | GetGlobalStatsCompleteAction
  | GetGlobalStatsFailedAction
  | GetSeeDocumentsAction
  | GetSeeDocumentsCompleteAction
  | GetSeeDocumentsFailedAction
  | SetReferrerAction
  | SetReferrerCompleteAction
  | SetReferrerFailedAction;
