import {
  AgendaEventDetailComponent,
  AgendaEventDetailPageComponent,
  AgendaEventsListComponent,
  AgendaEventsListPageComponent,
  ApiRequestStatusComponent,
  CreateAgendaEventPageComponent,
  CreateTransactionComponent,
  CreateTransactionPageComponent,
  EventParticipantsComponent,
  EventParticipantsPageComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementAmountComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  IyoSeeComponent,
  KycComponent,
  KycUpdatesComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent,
  TransactionListComponent,
  TruliooDataFieldsComponent,
  TruliooInformationComponent,
  UserDetailsPageComponent,
  UserListComponent,
  UserListPageComponent,
  UserPageComponent,
  UserTransactionsListPageComponent,
  WalletBalanceComponent
} from '../components/index';
import { KycPageComponent } from '../pages/kyc/index';
import { ApiErrorService } from './api-error.service';
import { TffConfig } from './tff-config.service';
import { TffService } from './tff.service';

export const TFF_PROVIDERS: any[] = [
  TffService,
  TffConfig,
  ApiErrorService,
];

export const TFF_PAGES = [
  KycPageComponent
];

export const TFF_COMPONENTS: any[] = [
  AgendaEventDetailComponent,
  AgendaEventDetailPageComponent,
  AgendaEventsListComponent,
  AgendaEventsListPageComponent,
  ApiRequestStatusComponent,
  CreateAgendaEventPageComponent,
  CreateTransactionComponent,
  CreateTransactionPageComponent,
  EventParticipantsComponent,
  EventParticipantsPageComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementAmountComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  IyoSeeComponent,
  KycComponent,
  KycUpdatesComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent,
  TransactionListComponent,
  TruliooDataFieldsComponent,
  TruliooInformationComponent,
  UserDetailsPageComponent,
  UserListComponent,
  UserListPageComponent,
  UserPageComponent,
  UserTransactionsListPageComponent,
  WalletBalanceComponent,
  ...TFF_PAGES
];

export * from './tff-config.service';
export * from './tff.service';
