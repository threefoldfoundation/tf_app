import { MetaGuard } from '@ngx-meta/core';
import { GlobalStatsDetailPageComponent, GlobalStatsListPageComponent } from '../components/global-stats';

export const GLOBAL_STATS_ROUTES = [
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
];
