import { MetaGuard } from '@ngx-meta/core';
import {
  KycPageComponent,
  UserDetailsPageComponent,
  UserListPageComponent,
  UserNodeOrdersPageComponent,
  UserPageComponent,
  UserPurchaseAgreementsPageComponent,
  UserTransactionsListPageComponent,
} from '../pages';
import { UserFlowRunsDetailsPageComponent, UserFlowRunsPageComponent } from '../pages/users';

export const USERS_ROUTES = [
  {
    path: 'users',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'people',
      id: 'tff_users',
      meta: {
        title: 'tff.users',
      },
    },
    component: UserListPageComponent,
  },
  {
    path: 'users/:username',
    canActivate: [ MetaGuard ],
    canActivateChild: [ MetaGuard ],
    component: UserPageComponent,
    data: {
      sidebarItems: [
        {
          label: 'tff.details',
          icon: 'person',
          route: 'details',
        },
        {
          label: 'tff.kyc',
          icon: 'search',
          route: 'kyc',
        },
        {
          label: 'tff.transactions',
          icon: 'compare_arrows',
          route: 'transactions',
        },
        {
          label: 'tff.node_orders',
          icon: 'shop',
          route: 'node-orders',
        },
        {
          label: 'tff.investment_agreements',
          icon: 'attach_money',
          route: 'investment-agreements',
        },
        {
          label: 'tff.flow_statistics',
          icon: 'timeline',
          route: 'flow-statistics',
        } ],
      meta: { title: 'tff.users' },
    },
    children: [
      { path: '', redirectTo: 'kyc', pathMatch: 'full' },
      {
        path: 'details',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.user_details' } },
        component: UserDetailsPageComponent,
      },
      {
        path: 'kyc',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.kyc' } },
        component: KycPageComponent,
      },
      {
        path: 'transactions',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.transactions' } },
        component: UserTransactionsListPageComponent,
      },
      {
        path: 'node-orders',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.node_orders' } },
        component: UserNodeOrdersPageComponent,
      },
      {
        path: 'investment-agreements',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.investment_agreements' } },
        component: UserPurchaseAgreementsPageComponent,
      },
      {
        path: 'flow-statistics',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.flow_statistics' } },
        component: UserFlowRunsPageComponent,
      },
      {
        path: 'flow-statistics/:flowRunId',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.flow_statistics' } },
        component: UserFlowRunsDetailsPageComponent,
      },
    ],
  },
];
