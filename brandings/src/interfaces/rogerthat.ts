import { AgendaEvent } from './agenda.interfaces';
import { NodeInfo } from './node-status.interfaces';

export type UserData = Readonly<Partial<UserDataInternal>>;

export enum PaymentQRCodeType {
  TRANSACTION = 1,
  PAY = 2
}

export interface UserDataInternal {
  has_referrer: boolean;
  kyc: UserDataKYC;
  nodes: NodeInfo[];
  support_chat_id: string;
  referrals: any[]; // todo unknown type
  hoster: UserDataHoster;
  todo_lists: string[];
  invitation_code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  billing_address: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
}

export interface UserDataHoster {
  can_order: boolean;
}

export interface UserDataKYC {
  verified: boolean;
  status: KYCStatus;
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

export type ServiceData = Readonly<Partial<ServiceDataInternal>>;

export interface ServiceDataInternal {
  agenda_events: AgendaEvent[];
}
