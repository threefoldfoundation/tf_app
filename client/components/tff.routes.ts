import { MetaGuard } from '@ngx-meta/core';
import { Route } from '../components/app.routes';
import { OrderDetailPageComponent } from '../frameworks/tff-backend/components/order-detail-page.component';
import { OrderListPageComponent } from '../frameworks/tff-backend/components/order-list-page.component';

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
];
