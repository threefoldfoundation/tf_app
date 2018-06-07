import { MetaGuard } from '@ngx-meta/core';
import { CreateNodePageComponent, EditNodePageComponent, NodesPageComponent } from '../pages/nodes';

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
    path: 'nodes/create',
    canActivate: [ MetaGuard ],
    data: {
      meta: {
        title: 'tff.create_node',
      },
    },
    component: CreateNodePageComponent,
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
