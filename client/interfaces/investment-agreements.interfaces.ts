export enum InvestmentAgreementsStatuses {
  CANCELED = -1,
  CREATED = 0,
  SIGNED = 1,
  PAID = 2,
}

export interface GetInvestmentAgreementsPayload {
  cursor: string | null;
  status: InvestmentAgreementsStatuses;
}

export const INVESTMENT_AGREEMENT_STATUSES = {
  [InvestmentAgreementsStatuses.CANCELED]: 'tff.canceled',
  [InvestmentAgreementsStatuses.CREATED]: 'tff.created',
  [InvestmentAgreementsStatuses.SIGNED]: 'tff.signed',
  [InvestmentAgreementsStatuses.PAID]: 'tff.paid',
};

export interface InvestmentAgreement {
  id: number;
  app_user: string;
  referrer: string;
  amount: number;
  currency: string;
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

export interface InvestmentAgreementList {
  cursor: string | null;
  more: boolean;
  results: InvestmentAgreement[];
}
