import { MetaGuard } from '@ngx-meta/core';
import { Route } from '../../framework/client/app.routes';
import { CreateAgendaEventPageComponent } from './components/agenda/create-agenda-event-page.component';
import {
  AgendaEventDetailPageComponent,
  AgendaEventsListPageComponent,
  CreateTransactionPageComponent,
  EventParticipantsPageComponent,
  GlobalStatsDetailPageComponent,
  GlobalStatsListPageComponent,
  InvestmentAgreementDetailPageComponent,
  InvestmentAgreementListPageComponent,
  OrderDetailPageComponent,
  OrderListPageComponent,
  UserDetailsPageComponent,
  UserListPageComponent,
  UserPageComponent,
  UserTransactionsListPageComponent
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
      },
    },
    component: OrderListPageComponent,
  },
  {
    path: 'orders/:orderId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.order_detail' } },
    component: OrderDetailPageComponent,
  },
  {
    path: 'investment-agreements',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'attach_money',
      id: 'tff_investment_agreements',
      meta: {
        title: 'tff.investment_agreements',
      },
    },
    component: InvestmentAgreementListPageComponent,
  },
  {
    path: 'investment-agreements/:investmentAgreementId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.investment_agreement_detail' } },
    component: InvestmentAgreementDetailPageComponent,
  },
  {
    path: 'global-stats',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'poll',
      id: 'tff_global_stats',
      meta: {
        title: 'tff.global_stats',
      },
    },
    component: GlobalStatsListPageComponent,
  },
  {
    path: 'global-stats/:globalStatsId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.global_stats' } },
    component: GlobalStatsDetailPageComponent,
  },
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
        //   {
        //   label: 'tff.details',
        //   icon: 'person',
        //   route: 'details',
        // },
        {
          label: 'tff.transactions',
          icon: 'attach_money',
          route: 'transactions',
        } ],
      meta: { title: 'tff.users' },
    },
    children: [
      { path: '', redirectTo: 'transactions', pathMatch: 'full' },
      {
        path: 'details',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.user_details' } },
        component: UserDetailsPageComponent,
      },
      {
        path: 'transactions',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.transactions' } },
        component: UserTransactionsListPageComponent,
      },
      {
        path: 'transactions/create',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.create_transaction' } },
        component: CreateTransactionPageComponent,
      } ],
  },
  {
    path: 'agenda',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'event',
      id: 'tff_agenda',
      meta: {
        title: 'tff.agenda',
      }
    },
    component: AgendaEventsListPageComponent,
  },
  {
    path: 'agenda/create',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.create_event' } },
    component: CreateAgendaEventPageComponent,
  },
  {
    path: 'agenda/:eventId',
    canActivate: [ MetaGuard ],
    canActivateChild: [ MetaGuard ],
    data: {
      sidebarItems: [
        { label: 'tff.details', 'icon': 'edit ', route: 'details' },
        { label: 'tff.participants', 'icon': 'group', route: 'participants' },
      ],
      meta: { title: 'tff.agenda' }
    },
    children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      {
        path: 'details',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.event_details' } },
        component: AgendaEventDetailPageComponent,
      },
      {
        path: 'participants',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.participants' } },
        component: EventParticipantsPageComponent,
      } ]
  },
];
