import { SeeDocumentDetails } from './iyo-see.interfaces';

export enum InvestmentAgreementsStatuses {
  CANCELED = -1,
  CREATED = 0,
  SIGNED = 1,
  PAID = 2,
}

export interface InvestmentAgreementsQuery {
  cursor: string | null;
  status: InvestmentAgreementsStatuses;
  query: string | null;
}

export const INVESTMENT_AGREEMENT_STATUSES = {
  [ InvestmentAgreementsStatuses.CANCELED ]: 'tff.canceled',
  [ InvestmentAgreementsStatuses.CREATED ]: 'tff.created',
  [ InvestmentAgreementsStatuses.SIGNED ]: 'tff.signed',
  [ InvestmentAgreementsStatuses.PAID ]: 'tff.paid',
};

export interface InvestmentAgreement {
  id: number;
  app_user: string;
  amount: number;
  token: string;
  /**
   * Actual token count (float)
   */
  token_count_float: number;
  /**
   * Token count multiplied by (10 ^ token_precision)
   */
  token_count: number;
  /**
   * Numbers after comma
   */
  token_precision: number;
  currency: string;
  name: string;
  address: string;
  reference: string;
  iyo_see_id: string;
  signature_payload: string | null;
  signature: string | null;
  status: InvestmentAgreementsStatuses;
  creation_time: number;
  sign_time: number | null;
  paid_time: number | null;
  cancel_time: number | null;
  modification_time: number;
}


export interface InvestmentAgreementDetail extends InvestmentAgreement {
  see_document: SeeDocumentDetails | null;
}

export interface InvestmentAgreementList {
  cursor: string | null;
  more: boolean;
  results: InvestmentAgreement[];
}
