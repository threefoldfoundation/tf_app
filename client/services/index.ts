import { TffService } from './tff.service';
import { TffConfig } from './tff-config.service';
import {
  ApiRequestStatusComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent
} from '../components/index';

export const TFF_PROVIDERS: any[] = [
  TffService,
  TffConfig,
];

export const TFF_COMPONENTS: any[] = [
  ApiRequestStatusComponent,
  GlobalStatsDetailComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementDetailComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListComponent,
  InvestmentAgreementListPageComponent,
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent
];

export * from './tff-config.service';
export * from './tff.service';
