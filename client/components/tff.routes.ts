import { MetaGuard } from '@ngx-meta/core';
import { OrderListComponent } from '../frameworks/tff-backend/index';
import { Route } from '../components/app.routes';

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
    component: OrderListComponent
  },
  {
    path: 'orders/:order_id',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.order_detail' } },
    component: OrderListComponent // todo detail component
  },
];
