import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../../framework/client/environments/environment';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { AddToolbarItemAction, RemoveToolbarItemAction } from '../../../../framework/client/toolbar/actions';
import { ToolbarItemTypes } from '../../../../framework/client/toolbar/interfaces';
import { GetNodesAction } from '../../actions';
import { NodesQuery, UserNodeStatus } from '../../interfaces';
import { ITffState } from '../../states';
import { getNodes, getNodesStatus } from '../../tff.state';

const tffConf = environment.configuration.plugins.tff_backend;
@Component({
  selector: 'tff-nodes-pages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tff-nodes [nodes]="nodes$ | async" [status]="nodesStatus$ | async" (searchNodes)="onSearchNodes($event)"></tff-nodes>`,
})
export class NodesPageComponent implements OnInit, OnDestroy {
  nodes$: Observable<UserNodeStatus[]>;
  nodesStatus$: Observable<ApiRequestStatus>;
  query: NodesQuery = { sort_by: null, direction: '' };
  statisticsUrl = tffConf.grafana_url + tffConf.grafana_node_dashboard;

  constructor(private store: Store<ITffState>) {
  }

  ngOnInit() {
    this.nodes$ = this.store.pipe(select(getNodes));
    this.nodesStatus$ = this.store.pipe(select(getNodesStatus));
    this.search();
    this.store.dispatch(new AddToolbarItemAction({
      icon: 'timeline',
      id: 'node-statistics',
      label: 'tff.statistics',
      type: ToolbarItemTypes.BUTTON,
      persistent: false,
      href: this.statisticsUrl,
    }));
  }

  ngOnDestroy() {
    this.store.dispatch(new RemoveToolbarItemAction('node-statistics'));
  }

  search() {
    this.store.dispatch(new GetNodesAction(this.query));
  }

  onSearchNodes(query: NodesQuery) {
    this.query = { ...query };
    this.search();
  }
}
