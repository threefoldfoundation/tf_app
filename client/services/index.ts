import {
  ApiRequestStatusComponent,
  CreateTransactionComponent,
  CreateTransactionPageComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementAmountComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  IyoSeeComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent,
  TransactionListComponent,
  UserDetailsPageComponent,
  UserListComponent,
  UserListPageComponent,
  UserPageComponent,
  UserTransactionsListPageComponent,
  WalletBalanceComponent
} from '../components/index';
import { TffConfig } from './tff-config.service';
import { TffService } from './tff.service';
import { ApiErrorService } from './api-error.service';

export const TFF_PROVIDERS: any[] = [
  TffService,
  TffConfig,
  ApiErrorService,
];

export const TFF_COMPONENTS: any[] = [
  ApiRequestStatusComponent,
  CreateTransactionComponent,
  CreateTransactionPageComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementAmountComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  IyoSeeComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent,
  TransactionListComponent,
  UserDetailsPageComponent,
  UserListComponent,
  UserListPageComponent,
  UserPageComponent,
  UserTransactionsListPageComponent,
  WalletBalanceComponent
];

export * from './tff-config.service';
export * from './tff.service';
