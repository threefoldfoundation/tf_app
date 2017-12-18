import { UserSearchComponent } from '../components';
import {
  AgendaEventDetailComponent, AgendaEventDetailPageComponent, AgendaEventsListComponent, AgendaEventsListPageComponent,
  ApiRequestStatusComponent, CreateAgendaEventPageComponent, CreateTransactionComponent, CreateTransactionPageComponent,
  EventParticipantsComponent, EventParticipantsPageComponent, GlobalStatsDetailComponent, GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent, InvestmentAgreementAmountComponent, InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent, InvestmentAgreementListComponent, InvestmentAgreementListPageComponent, IyoSeeComponent,
  KycComponent, KycUpdatesComponent, OrderDetailComponent, OrderDetailPageComponent, OrderListComponent, OrderListPageComponent,
  TransactionListComponent, UserListComponent, UserTransactionsListPageComponent, WalletBalanceComponent,
} from '../components/index';
import { KycPageComponent } from '../pages/kyc';
import { UserDetailsPageComponent, UserListPageComponent, UserPageComponent } from '../pages/users';
import { ApiErrorService } from './api-error.service';
import { TffConfig } from './tff-config.service';
import { TffService } from './tff.service';

export const TFF_PROVIDERS: any[] = [
  TffService,
  TffConfig,
  ApiErrorService,
];

export const TFF_PAGES = [
  KycPageComponent,
  UserDetailsPageComponent,
  UserListPageComponent,
  UserPageComponent,
  UserTransactionsListPageComponent,
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
  UserListComponent,
  UserSearchComponent,
  WalletBalanceComponent,
  ...TFF_PAGES
];

export * from './tff-config.service';
export * from './tff.service';
