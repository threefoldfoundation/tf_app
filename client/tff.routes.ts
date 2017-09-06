import { MetaGuard } from '@ngx-meta/core';
import { Route } from '../../framework/client/app.routes';
import {
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListPageComponent,
  OrderDetailPageComponent,
  OrderListPageComponent
} from './components/index';

export const TffRoutes: Route[] = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  {
    path: 'orders',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'shop',
      id: 'tff_orders',
      meta: {
        title: 'tff.orders',
      }
    },
    component: OrderListPageComponent
  },
  {
    path: 'orders/:orderId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.order_detail' } },
    component: OrderDetailPageComponent
  },
  {
    path: 'investment-agreements',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'attach_money',
      id: 'tff_investment_agreements',
      meta: {
        title: 'tff.investment_agreements',
      }
    },
    component: InvestmentAgreementListPageComponent
  },
  {
    path: 'investment-agreements/:investmentAgreementId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.investment_agreement_detail' } },
    component: InvestmentAgreementDetailPageComponent
  },
  {
    path: 'global-stats',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'poll',
      id: 'tff_global_stats',
      meta: {
        title: 'tff.global_stats',
      }
    },
    component: GlobalStatsListPageComponent
  },
  {
    path: 'global-stats/:globalStatsId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.global_stats' } },
    component: GlobalStatsDetailPageComponent
  },
];
