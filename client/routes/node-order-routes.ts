import { MetaGuard } from '@ngx-meta/core';
import { OrderDetailPageComponent, OrderListPageComponent } from '../components/orders';

export const NODE_ORDER_ROUTES = [
  { path: '', redirectTo: 'node-orders', pathMatch: 'full' },
  { path: 'orders', redirectTo: 'node-orders', pathMatch: 'full' },
  {
    path: 'node-orders',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'shop',
      id: 'tff_orders',
      meta: {
        title: 'tff.node_orders',
      },
    },
    component: OrderListPageComponent,
  },
  { path: 'orders/:orderId', redirectTo: 'node-orders/:orderId', pathMatch: 'full' },
  {
    path: 'node-orders/:orderId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.order_detail' } },
    component: OrderDetailPageComponent,
  },
];
