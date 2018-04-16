import { Action } from '@ngrx/store';
import { EventPresence, UpdatePresenceData } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';

export enum BrandingActionTypes {
  GET_GLOBAL_STATS = 'Get global stats',
  GET_GLOBAL_STATS_COMPLETE = 'Get global stats complete',
  GET_GLOBAL_STATS_FAILED = 'Get global stats failed',
  GET_SEE_DOCUMENTS = 'Get see documents ',
  GET_SEE_DOCUMENTS_COMPLETE = 'Get see documents complete',
  GET_SEE_DOCUMENTS_FAILED = 'Get see documents failed',
  GET_EVENT_PRESENCE = 'Get event presence',
  GET_EVENT_PRESENCE_COMPLETE = 'Get events presence complete',
  GET_EVENT_PRESENCE_FAILED = 'Get events presence failed',
  UPDATE_EVENT_PRESENCE = 'Update event presence',
  UPDATE_EVENT_PRESENCE_COMPLETE = 'Update event presence complete',
  UPDATE_EVENT_PRESENCE_FAILED = 'Update event presence failed',
  GET_NODE_STATUS = 'Get node status',
  GET_NODE_STATUS_COMPLETE = 'Get node status complete',
  GET_NODE_STATUS_FAILED = 'Get node status failed',
  GET_NODE_STATS = 'Get node stats',
  GET_NODE_STATS_COMPLETE = 'Get node stats complete',
  GET_NODE_STATS_FAILED = 'Get node stats failed',
}

export class GetGlobalStatsAction implements Action {
  readonly type = BrandingActionTypes.GET_GLOBAL_STATS;
}

export class GetGlobalStatsCompleteAction implements Action {
  readonly type = BrandingActionTypes.GET_GLOBAL_STATS_COMPLETE;

  constructor(public payload: GlobalStats[]) {
  }
}

export class GetGlobalStatsFailedAction implements Action {
  readonly type = BrandingActionTypes.GET_GLOBAL_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetSeeDocumentsAction implements Action {
  readonly type = BrandingActionTypes.GET_SEE_DOCUMENTS;
}

export class GetSeeDocumentsCompleteAction implements Action {
  readonly type = BrandingActionTypes.GET_SEE_DOCUMENTS_COMPLETE;

  constructor(public payload: SeeDocument[]) {
  }
}

export class GetSeeDocumentsFailedAction implements Action {
  readonly type = BrandingActionTypes.GET_SEE_DOCUMENTS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetEventPresenceAction implements Action {
  readonly type = BrandingActionTypes.GET_EVENT_PRESENCE;

  constructor(public payload: number) {
  }
}

export class GetEventPresenceCompleteAction implements Action {
  readonly type = BrandingActionTypes.GET_EVENT_PRESENCE_COMPLETE;

  constructor(public payload: EventPresence) {
  }
}

export class GetEventPresenceFailedAction implements Action {
  readonly type = BrandingActionTypes.GET_EVENT_PRESENCE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class UpdateEventPresenceAction implements Action {
  readonly type = BrandingActionTypes.UPDATE_EVENT_PRESENCE;

  constructor(public payload: UpdatePresenceData) {
  }
}

export class UpdateEventPresenceCompleteAction implements Action {
  readonly type = BrandingActionTypes.UPDATE_EVENT_PRESENCE_COMPLETE;

  constructor(public payload: UpdatePresenceData) {
  }
}

export class UpdateEventPresenceFailedAction implements Action {
  readonly type = BrandingActionTypes.UPDATE_EVENT_PRESENCE_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetNodeStatusAction implements Action {
  readonly type = BrandingActionTypes.GET_NODE_STATUS;
}

export class GetNodeStatusCompleteAction implements Action {
  readonly type = BrandingActionTypes.GET_NODE_STATUS_COMPLETE;

  constructor(public payload: NodeInfo[]) {
  }
}

export class GetNodeStatusFailedAction implements Action {
  readonly type = BrandingActionTypes.GET_NODE_STATUS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetNodeStatsAction implements Action {
  readonly type = BrandingActionTypes.GET_NODE_STATS;

  constructor(public payload: NodeInfo[]) {
  }
}

export class GetNodeStatsCompleteAction implements Action {
  readonly type = BrandingActionTypes.GET_NODE_STATS_COMPLETE;

  constructor(public payload: NodeInfo[]) {
  }
}

export class GetNodeStatsFailedAction implements Action {
  readonly type = BrandingActionTypes.GET_NODE_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export type BrandingActions
  = GetGlobalStatsAction
  | GetGlobalStatsCompleteAction
  | GetGlobalStatsFailedAction
  | GetSeeDocumentsAction
  | GetSeeDocumentsCompleteAction
  | GetSeeDocumentsFailedAction
  | GetEventPresenceAction
  | GetEventPresenceCompleteAction
  | GetEventPresenceFailedAction
  | UpdateEventPresenceAction
  | UpdateEventPresenceCompleteAction
  | UpdateEventPresenceFailedAction
  | GetNodeStatsAction
  | GetNodeStatsCompleteAction
  | GetNodeStatsFailedAction
  | GetNodeStatusAction
  | GetNodeStatusCompleteAction
  | GetNodeStatusFailedAction;
