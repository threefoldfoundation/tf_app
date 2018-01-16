import { Route } from '../../../framework/client/app.routes';
import { AGENDA_ROUTES } from './agenda-routes';
import { FLOW_STATISTICS_ROUTES } from './flow-statistics-routes';
import { GLOBAL_STATS_ROUTES } from './global-stats-routes';
import { INSTALLATION_ROUTES } from './installation-routes';
import { INVESTMENT_AGREEMENT_ROUTES } from './investment-agreements-routes';
import { NODE_ORDER_ROUTES } from './node-order-routes';
import { USERS_ROUTES } from './users-routes';

export const TffRoutes: Route[] = [
  ...NODE_ORDER_ROUTES,
  ...INVESTMENT_AGREEMENT_ROUTES,
  ...GLOBAL_STATS_ROUTES,
  ...USERS_ROUTES,
  ...AGENDA_ROUTES,
  ...FLOW_STATISTICS_ROUTES,
  ...INSTALLATION_ROUTES,
];
