import { Profile } from '../../../its_you_online_auth/client/interfaces/user.interfaces';
import { DataFields } from './trulioo.interfaces';

export interface TffProfile {
  app_user: string;
  referrer_user: string;
  referrer_username: string;
  kyc: KYCInformation;
}

export enum KYCStatus {
  DENIED = -10,
  /**
   * Not verified, and not applied to be verified yet
   */
  UNVERIFIED = 0,
  /**
   * KYC flow has been send to the user
   */
  PENDING_SUBMIT = 10,
  /**
   * KYC data has been set by user
   */
  SUBMITTED = 20,
  /**
   * Admin verified the info sent in by the user, completed any missing data (e.g. MRZ1 from uploaded photo)
   * Info is now ready to be sent to Trulioo
   */
  INFO_SET = 30,
  /**
   * API call to Trulioo done, admin has to mark user as approved/denied now
   */
  PENDING_APPROVAL = 40,
  /**
   * Approved by admin
   */
  VERIFIED = 50,
}

export const KYCStatuses = [
  { value: KYCStatus.DENIED, label: 'tff.denied' },
  { value: KYCStatus.UNVERIFIED, label: 'tff.unverified' },
  { value: KYCStatus.PENDING_SUBMIT, label: 'tff.kyc_flow_sent' },
  { value: KYCStatus.SUBMITTED, label: 'tff.kyc_flow_finished' },
  { value: KYCStatus.INFO_SET, label: 'tff.info_set' },
  { value: KYCStatus.PENDING_APPROVAL, label: 'tff.pending_approval' },
  { value: KYCStatus.VERIFIED, label: 'tff.verified' },
];

export const KYC_STATUS_MAPPING: { [ key: number ]: KYCStatus[] } = {
  [ KYCStatus.DENIED ]: [],
  [ KYCStatus.UNVERIFIED ]: [ KYCStatus.PENDING_SUBMIT ],
  [ KYCStatus.PENDING_SUBMIT ]: [ KYCStatus.PENDING_SUBMIT ],
  [ KYCStatus.SUBMITTED ]: [ KYCStatus.INFO_SET ],
  [ KYCStatus.INFO_SET ]: [ KYCStatus.PENDING_APPROVAL ],
  [ KYCStatus.PENDING_APPROVAL ]: [ KYCStatus.VERIFIED, KYCStatus.DENIED, KYCStatus.PENDING_SUBMIT ],
  [ KYCStatus.VERIFIED ]: [],
};

export interface KYCInformation {
  status: KYCStatus;
  api_calls: KYCApiCall[];
  updates: KYCStatusUpdate[];
  pending_information: KYCDataFields;
  verified_information: KYCDataFields;
}

export interface KYCDataFields {
  country_code: string;
  data: Partial<DataFields>;
}

export interface KYCApiCall {
  // result: KYCVerifyResult;
  transaction_id: string;
  record_id: string;
  result: string;
  timestamp: string;
}

export interface KYCStatusUpdate {
  comment: string;
  author: string;
  timestamp: string;
  from_status: KYCStatus;
  to_status: KYCStatus;
}

export interface SearchUsersQuery {
  cursor: string | null;
  kyc_status: KYCStatus | null;
  query: string | null;
}

export interface UserList {
  cursor: string;
  more: boolean;
  results: Profile[];
}

export interface SetKYCStatusPayload {
  status: KYCStatus;
  comment?: string;
  data: Partial<DataFields>;
}
