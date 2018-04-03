import { MetaGuard } from '@ngx-meta/core';
import { EditNodePageComponent, NodesPageComponent } from '../pages/nodes';

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
  {
    path: 'nodes/:nodeId',
    canActivate: [ MetaGuard ],
    data: {
      meta: {
        title: 'tff.edit_node',
      },
    },
    component: EditNodePageComponent,
  },
];
