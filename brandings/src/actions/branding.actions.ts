import { Action } from '@ngrx/store';
import { AgendaEvent, EventPresence, UpdatePresenceData } from '../interfaces/agenda.interfaces';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { NodeInfo } from '../interfaces/node-status.interfaces';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { SeeDocument } from '../interfaces/see.interfaces';
import { CreateSignatureData, GetAddressPayload, ParsedTransaction } from '../interfaces/wallet';
import { CameraType, CryptoAddress, CryptoTransaction, QrCodeScannedContent, SupportedAlgorithms } from '../manual_typings/rogerthat';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { ApiCallResult } from '../services/rogerthat.service';

interface IBrandingActionTypes {
  API_CALL: '[rogerthat] Api call';
  API_CALL_COMPLETE: '[rogerthat] Api call complete';
  SCAN_QR_CODE: '[rogerthat] Scan QR code';
  SCAN_QR_CODE_STARTED: '[rogerthat] Scan QR code started';
  SCAN_QR_CODE_UPDATE: '[rogerthat] Scan QR code update';
  SCAN_QR_CODE_FAILED: '[rogerthat] Scan QR code failed';
  GET_GLOBAL_STATS: 'Get global stats';
  GET_GLOBAL_STATS_COMPLETE: 'Get global stats complete';
  GET_GLOBAL_STATS_FAILED: 'Get global stats failed';
  GET_SEE_DOCUMENTS: 'Get see documents ';
  GET_SEE_DOCUMENTS_COMPLETE: 'Get see documents complete';
  GET_SEE_DOCUMENTS_FAILED: 'Get see documents failed';
  GET_EVENTS: 'Get events';
  GET_EVENTS_COMPLETE: 'Get events complete';
  GET_EVENTS_FAILED: 'Get events failed';
  GET_EVENT_PRESENCE: 'Get event presence';
  GET_EVENT_PRESENCE_COMPLETE: 'Get events presence complete';
  GET_EVENT_PRESENCE_FAILED: 'Get events presence failed';
  UPDATE_EVENT_PRESENCE: 'Update event presence';
  UPDATE_EVENT_PRESENCE_COMPLETE: 'Update event presence complete';
  UPDATE_EVENT_PRESENCE_FAILED: 'Update event presence failed';
  GET_NODE_STATUS: 'Get node status';
  GET_NODE_STATUS_COMPLETE: 'Get node status complete';
  GET_NODE_STATUS_FAILED: 'Get node status failed';
  UPDATE_NODE_STATUS: 'Update node status';
  UPDATE_NODE_STATUS_COMPLETE: 'Update node status complete';
  UPDATE_NODE_STATUS_FAILED: 'Update node status failed';
  GET_TRANSACTIONS: 'Get transactions';
  GET_TRANSACTIONS_COMPLETE: 'Get transactions complete';
  GET_TRANSACTIONS_FAILED: 'Get transactions failed';
  GET_ADDRESS: 'Get address';
  GET_ADDRESS_COMPLETE: 'Get address complete';
  GET_ADDRESS_FAILED: 'Get address failed';
  CREATE_SIGNATURE_DATA: 'Create signature data';
  CREATE_SIGNATURE_DATA_COMPLETE: 'Create signature data complete';
  CREATE_SIGNATURE_DATA_FAILED: 'Create signature data failed';
  CREATE_TRANSACTION: 'Create transaction';
  CREATE_TRANSACTION_COMPLETE: 'Create transaction complete';
  CREATE_TRANSACTION_FAILED: 'Create transaction failed';
}

export const BrandingActionTypes: IBrandingActionTypes = {
  API_CALL: '[rogerthat] Api call',
  API_CALL_COMPLETE: '[rogerthat] Api call complete',
  SCAN_QR_CODE: '[rogerthat] Scan QR code',
  SCAN_QR_CODE_STARTED: '[rogerthat] Scan QR code started',
  SCAN_QR_CODE_UPDATE: '[rogerthat] Scan QR code update',
  SCAN_QR_CODE_FAILED: '[rogerthat] Scan QR code failed',
  GET_GLOBAL_STATS: 'Get global stats',
  GET_GLOBAL_STATS_COMPLETE: 'Get global stats complete',
  GET_GLOBAL_STATS_FAILED: 'Get global stats failed',
  GET_SEE_DOCUMENTS: 'Get see documents ',
  GET_SEE_DOCUMENTS_COMPLETE: 'Get see documents complete',
  GET_SEE_DOCUMENTS_FAILED: 'Get see documents failed',
  GET_EVENTS: 'Get events',
  GET_EVENTS_COMPLETE: 'Get events complete',
  GET_EVENTS_FAILED: 'Get events failed',
  GET_EVENT_PRESENCE: 'Get event presence',
  GET_EVENT_PRESENCE_COMPLETE: 'Get events presence complete',
  GET_EVENT_PRESENCE_FAILED: 'Get events presence failed',
  UPDATE_EVENT_PRESENCE: 'Update event presence',
  UPDATE_EVENT_PRESENCE_COMPLETE: 'Update event presence complete',
  UPDATE_EVENT_PRESENCE_FAILED: 'Update event presence failed',
  GET_NODE_STATUS: 'Get node status',
  GET_NODE_STATUS_COMPLETE: 'Get node status complete',
  GET_NODE_STATUS_FAILED: 'Get node status failed',
  UPDATE_NODE_STATUS: 'Update node status',
  UPDATE_NODE_STATUS_COMPLETE: 'Update node status complete',
  UPDATE_NODE_STATUS_FAILED: 'Update node status failed',
  GET_TRANSACTIONS: 'Get transactions',
  GET_TRANSACTIONS_COMPLETE: 'Get transactions complete',
  GET_TRANSACTIONS_FAILED: 'Get transactions failed',
  GET_ADDRESS: 'Get address',
  GET_ADDRESS_COMPLETE: 'Get address complete',
  GET_ADDRESS_FAILED: 'Get address failed',
  CREATE_SIGNATURE_DATA: 'Create signature data',
  CREATE_SIGNATURE_DATA_COMPLETE: 'Create signature data complete',
  CREATE_SIGNATURE_DATA_FAILED: 'Create signature data failed',
  CREATE_TRANSACTION: 'Create transaction',
  CREATE_TRANSACTION_COMPLETE: 'Create transaction complete',
  CREATE_TRANSACTION_FAILED: 'Create transaction failed',
};

export class ApiCallAction implements Action {
  type = BrandingActionTypes.API_CALL;

  constructor(public method: string, public data?: any, public tag?: string | null) {
  }
}

export class ApiCallCompleteAction implements Action {
  type = BrandingActionTypes.API_CALL_COMPLETE;

  constructor(public payload: ApiCallResult) {
  }
}

export class ScanQrCodeAction implements Action {
  type = BrandingActionTypes.SCAN_QR_CODE;

  constructor(public payload: CameraType) {
  }
}

export class ScanQrCodeStartedAction implements Action {
  type = BrandingActionTypes.SCAN_QR_CODE_STARTED;
}

export class ScanQrCodeUpdateAction implements Action {
  type = BrandingActionTypes.SCAN_QR_CODE_UPDATE;

  constructor(public payload: QrCodeScannedContent) {
  }
}

export class ScanQrCodeFailedAction implements Action {
  type = BrandingActionTypes.SCAN_QR_CODE_FAILED;

  constructor(public payload: RogerthatError) {
  }
}

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

export class GetEventsAction implements Action {
  type = BrandingActionTypes.GET_EVENTS;
}

export class GetEventsCompleteAction implements Action {
  type = BrandingActionTypes.GET_EVENTS_COMPLETE;

  constructor(public payload: AgendaEvent[]) {
  }
}

export class GetEventsFailedAction implements Action {
  type = BrandingActionTypes.GET_EVENTS_FAILED;

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

export class UpdateNodeStatusAction implements Action {
  type = BrandingActionTypes.UPDATE_NODE_STATUS;

  constructor(public payload: NodeInfo[]) {
  }
}

export class UpdateNodeStatusCompleteAction implements Action {
  type = BrandingActionTypes.UPDATE_NODE_STATUS_COMPLETE;
}

export class UpdateNodeStatusFailedAction implements Action {
  type = BrandingActionTypes.UPDATE_NODE_STATUS_FAILED;

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

export class GetAddresssAction implements Action {
  type = BrandingActionTypes.GET_ADDRESS;

  constructor(public payload: GetAddressPayload) {
  }
}

export class GetAddresssCompleteAction implements Action {
  type = BrandingActionTypes.GET_ADDRESS_COMPLETE;

  constructor(public payload: CryptoAddress) {
  }
}

export class GetAddresssFailedAction implements Action {
  type = BrandingActionTypes.GET_ADDRESS_FAILED;

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
  = ApiCallAction
  | ApiCallCompleteAction
  | ScanQrCodeAction
  | ScanQrCodeStartedAction
  | ScanQrCodeUpdateAction
  | ScanQrCodeFailedAction
  | GetGlobalStatsAction
  | GetGlobalStatsCompleteAction
  | GetGlobalStatsFailedAction
  | GetSeeDocumentsAction
  | GetSeeDocumentsCompleteAction
  | GetSeeDocumentsFailedAction
  | GetEventsAction
  | GetEventsCompleteAction
  | GetEventsFailedAction
  | GetEventPresenceAction
  | GetEventPresenceCompleteAction
  | GetEventPresenceFailedAction
  | UpdateEventPresenceAction
  | UpdateEventPresenceCompleteAction
  | UpdateEventPresenceFailedAction
  | GetNodeStatusAction
  | GetNodeStatusCompleteAction
  | GetNodeStatusFailedAction
  | UpdateNodeStatusAction
  | UpdateNodeStatusCompleteAction
  | UpdateNodeStatusFailedAction
  | GetTransactionsAction
  | GetTransactionsCompleteAction
  | GetTransactionsFailedAction
  | GetAddresssAction
  | GetAddresssCompleteAction
  | GetAddresssFailedAction
  | CreateSignatureDataAction
  | CreateSignatureDataCompleteAction
  | CreateSignatureDataFailedAction
  | CreateTransactionAction
  | CreateTransactionCompleteAction
  | CreateTransactionFailedAction;
