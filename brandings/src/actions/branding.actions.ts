import { Action } from '@ngrx/store';
import { EventPresence, UpdatePresenceData } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { CreateSignatureData, ParsedTransaction } from '../interfaces/wallet';
import { CryptoTransaction, SupportedAlgorithms } from '../manual_typings/rogerthat';

interface IBrandingActionTypes {
  GET_GLOBAL_STATS: 'Get global stats';
  GET_GLOBAL_STATS_COMPLETE: 'Get global stats complete';
  GET_GLOBAL_STATS_FAILED: 'Get global stats failed';
  GET_SEE_DOCUMENTS: 'Get see documents ';
  GET_SEE_DOCUMENTS_COMPLETE: 'Get see documents complete';
  GET_SEE_DOCUMENTS_FAILED: 'Get see documents failed';
  GET_EVENT_PRESENCE: 'Get event presence';
  GET_EVENT_PRESENCE_COMPLETE: 'Get events presence complete';
  GET_EVENT_PRESENCE_FAILED: 'Get events presence failed';
  UPDATE_EVENT_PRESENCE: 'Update event presence';
  UPDATE_EVENT_PRESENCE_COMPLETE: 'Update event presence complete';
  UPDATE_EVENT_PRESENCE_FAILED: 'Update event presence failed';
  GET_NODE_STATUS: 'Get node status';
  GET_NODE_STATUS_COMPLETE: 'Get node status complete';
  GET_NODE_STATUS_FAILED: 'Get node status failed';
  GET_NODE_STATS: 'Get node stats';
  GET_NODE_STATS_COMPLETE: 'Get node stats complete';
  GET_NODE_STATS_FAILED: 'Get node stats failed';
  GET_TRANSACTIONS: 'Get transactions';
  GET_TRANSACTIONS_COMPLETE: 'Get transactions complete';
  GET_TRANSACTIONS_FAILED: 'Get transactions failed';
  CREATE_SIGNATURE_DATA: 'Create signature data';
  CREATE_SIGNATURE_DATA_COMPLETE: 'Create signature data complete';
  CREATE_SIGNATURE_DATA_FAILED: 'Create signature data failed';
  CREATE_TRANSACTION: 'Create transaction';
  CREATE_TRANSACTION_COMPLETE: 'Create transaction complete';
  CREATE_TRANSACTION_FAILED: 'Create transaction failed';
}

export const BrandingActionTypes: IBrandingActionTypes = {
  GET_GLOBAL_STATS: 'Get global stats',
  GET_GLOBAL_STATS_COMPLETE: 'Get global stats complete',
  GET_GLOBAL_STATS_FAILED: 'Get global stats failed',
  GET_SEE_DOCUMENTS: 'Get see documents ',
  GET_SEE_DOCUMENTS_COMPLETE: 'Get see documents complete',
  GET_SEE_DOCUMENTS_FAILED: 'Get see documents failed',
  GET_EVENT_PRESENCE: 'Get event presence',
  GET_EVENT_PRESENCE_COMPLETE: 'Get events presence complete',
  GET_EVENT_PRESENCE_FAILED: 'Get events presence failed',
  UPDATE_EVENT_PRESENCE: 'Update event presence',
  UPDATE_EVENT_PRESENCE_COMPLETE: 'Update event presence complete',
  UPDATE_EVENT_PRESENCE_FAILED: 'Update event presence failed',
  GET_NODE_STATUS: 'Get node status',
  GET_NODE_STATUS_COMPLETE: 'Get node status complete',
  GET_NODE_STATUS_FAILED: 'Get node status failed',
  GET_NODE_STATS: 'Get node stats',
  GET_NODE_STATS_COMPLETE: 'Get node stats complete',
  GET_NODE_STATS_FAILED: 'Get node stats failed',
  GET_TRANSACTIONS: 'Get transactions',
  GET_TRANSACTIONS_COMPLETE: 'Get transactions complete',
  GET_TRANSACTIONS_FAILED: 'Get transactions failed',
  CREATE_SIGNATURE_DATA: 'Create signature data',
  CREATE_SIGNATURE_DATA_COMPLETE: 'Create signature data complete',
  CREATE_SIGNATURE_DATA_FAILED: 'Create signature data failed',
  CREATE_TRANSACTION: 'Create transaction',
  CREATE_TRANSACTION_COMPLETE: 'Create transaction complete',
  CREATE_TRANSACTION_FAILED: 'Create transaction failed',
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

export class GetNodeStatsAction implements Action {
  type = BrandingActionTypes.GET_NODE_STATS;

  constructor(public payload: NodeInfo[]) {
  }
}

export class GetNodeStatsCompleteAction implements Action {
  type = BrandingActionTypes.GET_NODE_STATS_COMPLETE;

  constructor(public payload: NodeInfo[]) {
  }
}

export class GetNodeStatsFailedAction implements Action {
  type = BrandingActionTypes.GET_NODE_STATS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class GetTransactionsAction implements Action {
  type = BrandingActionTypes.GET_TRANSACTIONS;

  constructor(public address: string) {
  }
}

export class GetTransactionsCompleteAction implements Action {
  type = BrandingActionTypes.GET_TRANSACTIONS_COMPLETE;

  constructor(public payload: ParsedTransaction[]) {
  }
}

export class GetTransactionsFailedAction implements Action {
  type = BrandingActionTypes.GET_TRANSACTIONS_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class CreateSignatureDataAction implements Action {
  type = BrandingActionTypes.CREATE_SIGNATURE_DATA;

  constructor(public payload: CreateSignatureData) {
  }
}

export class CreateSignatureDataCompleteAction implements Action {
  type = BrandingActionTypes.CREATE_SIGNATURE_DATA_COMPLETE;

  constructor(public payload: CryptoTransaction) {
  }
}

export class CreateSignatureDataFailedAction implements Action {
  type = BrandingActionTypes.CREATE_SIGNATURE_DATA_FAILED;

  constructor(public payload: ApiRequestStatus) {
  }
}

export class CreateTransactionAction implements Action {
  type = BrandingActionTypes.CREATE_TRANSACTION;

  constructor(public payload: CryptoTransaction, public keyName: string, public algorithm: SupportedAlgorithms, public index: number,
              public message: string) {
  }
}

export class CreateTransactionCompleteAction implements Action {
  type = BrandingActionTypes.CREATE_TRANSACTION_COMPLETE;
}

export class CreateTransactionFailedAction implements Action {
  type = BrandingActionTypes.CREATE_TRANSACTION_FAILED;

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
  | GetNodeStatusFailedAction
  | GetTransactionsAction
  | GetTransactionsCompleteAction
  | GetTransactionsFailedAction
  | CreateSignatureDataAction
  | CreateSignatureDataCompleteAction
  | CreateSignatureDataFailedAction
  | CreateTransactionAction
  | CreateTransactionCompleteAction
  | CreateTransactionFailedAction;
