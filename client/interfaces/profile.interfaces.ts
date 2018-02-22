import { Profile } from '../../../its_you_online_auth/client/interfaces';
import { Applicant } from './onfido.interfaces';
import { PaginatedResult } from './shared.interfaces';

export enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
  REBOOTING = 'rebooting',
}

export interface NodeInfo {
  status: NodeStatus;
  id: string;
  serial_number: string;
}

export interface TffProfile {
  app_user: string;
  nodes: NodeStatus[];
  kyc: KYCInformation;
  referrer_user: string;
  referrer_username: string;
  username: string;
  referral_code: string;
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
   * Admin verified the info sent in by the user, completed any missing data
   * Info is now ready to be sent to Onfido
   */
  INFO_SET = 30,
  /**
   * API call to Onfido done, admin has to mark user as approved/denied now
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
  [ KYCStatus.SUBMITTED ]: [ KYCStatus.PENDING_APPROVAL ],
  // [ KYCStatus.SUBMITTED ]: [ KYCStatus.INFO_SET ],
  // [ KYCStatus.INFO_SET ]: [ KYCStatus.PENDING_APPROVAL ],
  [ KYCStatus.PENDING_APPROVAL ]: [ KYCStatus.VERIFIED, KYCStatus.DENIED, KYCStatus.PENDING_SUBMIT ],
  [ KYCStatus.VERIFIED ]: [ KYCStatus.PENDING_SUBMIT ],
};

export interface KYCInformation {
  status: KYCStatus;
  updates: KYCStatusUpdate[];
  applicant_id: string;
  utility_bill_url: string | null;
  utility_bill_verified: boolean;
}

export interface KYCStatusUpdate {
  comment: string;
  author: string;
  timestamp: string;
  from_status: KYCStatus;
  to_status: KYCStatus;
}

export interface SearchUsersQuery {
  cursor?: string | null;
  kyc_status?: KYCStatus;
  query?: string;
}

export type UserList = PaginatedResult<Profile>;

export interface SetKYCStatusPayload {
  status: KYCStatus;
  comment?: string;
  data: Partial<Applicant>;
}

export interface UserNodeStatus {
  profile: Profile;
  nodes: NodeInfo[];
}

export interface NodesQuery {
  status: NodeStatus | null | '';
}
