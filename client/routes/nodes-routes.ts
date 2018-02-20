import { MetaGuard } from '@ngx-meta/core';
import { NodesPageComponent } from '../pages/nodes';

export const NODES_ROUTES = [
  {
    path: 'nodes',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'cloud',
      id: 'tff_nodes',
      meta: {
        title: 'tff.nodes',
      },
    },
    component: NodesPageComponent,
  },
];
