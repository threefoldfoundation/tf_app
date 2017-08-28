import { TffService } from './tff.service';
import { TffConfig } from './tff-config.service';
import {
  OrderDetailComponent,
  OrderDetailPageComponent,
  OrderListComponent,
  OrderListPageComponent
} from '../components/index';

export const TFF_PROVIDERS: any[] = [
  TffService,
  TffConfig
];

export const TFF_COMPONENTS: any[] = [
  OrderListComponent,
  OrderListPageComponent,
  OrderDetailComponent,
  OrderDetailPageComponent
];

export * from './tff-config.service';
export * from './tff.service';
