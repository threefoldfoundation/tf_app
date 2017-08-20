import { TffService } from './tff.service';
import { TffConfig } from './tff-config.service';
import { OrderListComponent } from '../components/order-list.component';

export const TFF_PROVIDERS: any[] = [
  TffService,
  TffConfig
];

export const TFF_COMPONENTS: any[] = [
  OrderListComponent
];

export * from './tff-config.service';
export * from './tff.service';
