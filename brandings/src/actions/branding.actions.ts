import { Action } from '@ngrx/store';
import { EventPresence, UpdatePresenceData } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { SetReferralResult } from '../interfaces/referrals.interfaces';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';

interface IBrandingActionTypes {
  GET_GLOBAL_STATS: 'Get global stats';
  GET_GLOBAL_STATS_COMPLETE: 'Get global stats complete';
  GET_GLOBAL_STATS_FAILED: 'Get global stats failed';
  GET_SEE_DOCUMENTS: 'Get see documents ';
  GET_SEE_DOCUMENTS_COMPLETE: 'Get see documents complete';
  GET_SEE_DOCUMENTS_FAILED: 'Get see documents failed';
  SET_REFERRER: 'Set referrer';
  SET_REFERRER_COMPLETE: 'Set referrer complete';
  SET_REFERRER_FAILED: 'Set referrer failed';
  GET_EVENT_PRESENCE: 'Get event presence';
  GET_EVENT_PRESENCE_COMPLETE: 'Get events presence complete';
  GET_EVENT_PRESENCE_FAILED: 'Get events presence failed';
  UPDATE_EVENT_PRESENCE: 'Update event presence';
  UPDATE_EVENT_PRESENCE_COMPLETE: 'Update event presence complete';
  UPDATE_EVENT_PRESENCE_FAILED: 'Update event presence failed';
  GET_NODE_STATUS: 'Get node status';
  GET_NODE_STATUS_COMPLETE: 'Get node status complete';
  GET_NODE_STATUS_FAILED: 'Get node status failed';
}

export const BrandingActionTypes: IBrandingActionTypes = {
  GET_GLOBAL_STATS: 'Get global stats',
  GET_GLOBAL_STATS_COMPLETE: 'Get global stats complete',
  GET_GLOBAL_STATS_FAILED: 'Get global stats failed',
  GET_SEE_DOCUMENTS: 'Get see documents ',
  GET_SEE_DOCUMENTS_COMPLETE: 'Get see documents complete',
  GET_SEE_DOCUMENTS_FAILED: 'Get see documents failed',
  SET_REFERRER: 'Set referrer',
  SET_REFERRER_COMPLETE: 'Set referrer complete',
  SET_REFERRER_FAILED: 'Set referrer failed',
  GET_EVENT_PRESENCE: 'Get event presence',
  GET_EVENT_PRESENCE_COMPLETE: 'Get events presence complete',
  GET_EVENT_PRESENCE_FAILED: 'Get events presence failed',
  UPDATE_EVENT_PRESENCE: 'Update event presence',
  UPDATE_EVENT_PRESENCE_COMPLETE: 'Update event presence complete',
  UPDATE_EVENT_PRESENCE_FAILED: 'Update event presence failed',
  GET_NODE_STATUS: 'Get node status',
  GET_NODE_STATUS_COMPLETE: 'Get node status complete',
  GET_NODE_STATUS_FAILED: 'Get node status failed',
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

  constructor(public payload: ApiRequestStatus) {
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

  constructor(public payload: ApiRequestStatus) {
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

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetEventPresenceAction implements Action {
  type = BrandingActionTypes.GET_EVENT_PRESENCE;

  constructor(public payload: number) {
  }
}

export class GetEventPresenceCompleteAction implements Action {
  type = BrandingActionTypes.GET_EVENT_PRESENCE_COMPLETE;

  constructor(public payload: EventPresence) {
  }
}

export class GetEventPresenceFailedAction implements Action {
  type = BrandingActionTypes.GET_EVENT_PRESENCE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateEventPresenceAction implements Action {
  type = BrandingActionTypes.UPDATE_EVENT_PRESENCE;

  constructor(public payload: UpdatePresenceData) {
  }
}

export class UpdateEventPresenceCompleteAction implements Action {
  type = BrandingActionTypes.UPDATE_EVENT_PRESENCE_COMPLETE;

  constructor(public payload: UpdatePresenceData) {
  }
}

export class UpdateEventPresenceFailedAction implements Action {
  type = BrandingActionTypes.UPDATE_EVENT_PRESENCE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetNodeStatusAction implements Action {
  type = BrandingActionTypes.GET_NODE_STATUS;
}

export class GetNodeStatusCompleteAction implements Action {
  type = BrandingActionTypes.GET_NODE_STATUS_COMPLETE;

  constructor(public payload: NodeInfo[]) {
  }
}

export class GetNodeStatusFailedAction implements Action {
  type = BrandingActionTypes.GET_NODE_STATUS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export type BrandingActions =
  GetGlobalStatsAction
  | GetGlobalStatsCompleteAction
  | GetGlobalStatsFailedAction
  | GetSeeDocumentsAction
  | GetSeeDocumentsCompleteAction
  | GetSeeDocumentsFailedAction
  | SetReferrerAction
  | SetReferrerCompleteAction
  | SetReferrerFailedAction
  | GetEventPresenceAction
  | GetEventPresenceCompleteAction
  | GetEventPresenceFailedAction
  | UpdateEventPresenceAction
  | UpdateEventPresenceCompleteAction
  | UpdateEventPresenceFailedAction
  | GetNodeStatusAction
  | GetNodeStatusCompleteAction
  | GetNodeStatusFailedAction;

