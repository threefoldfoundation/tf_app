import { MetaGuard } from '@ngx-meta/core';
import { InstallationLogsPageComponent, InstallationsPageComponent } from '../pages/monitoring';

export const INSTALLATION_ROUTES = [
  {
    path: 'installations',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'list',
      id: 'tff_installations',
      meta: {
        title: 'tff.app_installations',
      },
    },
    component: InstallationsPageComponent,
  },
  {
    path: 'installations/:installationId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.installation_details' } },
    component: InstallationLogsPageComponent,
  },
];
