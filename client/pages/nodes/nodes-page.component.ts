import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetNodesAction } from '../../actions';
import { NodesQuery, NodeStatus, UserNodeStatus } from '../../interfaces';
import { ITffState } from '../../states';
import { getNodes, getNodesStatus } from '../../tff.state';

@Component({
  selector: 'tff-nodes-pages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <mat-form-field>
        <mat-select [(ngModel)]="query.status" (ngModelChange)="search()">
          <mat-option *ngFor="let status of nodeStatuses" [value]="status.value">{{ status.label | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <tff-nodes [nodes]="nodes$ | async" [status]="nodesStatus$ | async"></tff-nodes>`,
})
export class NodesPageComponent implements OnInit {
  nodes$: Observable<UserNodeStatus[]>;
  nodesStatus$: Observable<ApiRequestStatus>;
  nodeStatuses = [
    { value: '', label: 'tff.all' },
    { value: NodeStatus.RUNNING, label: 'tff.node_status_running' },
    { value: NodeStatus.HALTED, label: 'tff.node_status_halted' },
  ];
  query: NodesQuery = { status: '' };

  constructor(private store: Store<ITffState>) {
  }

  ngOnInit() {
    this.nodes$ = this.store.pipe(select(getNodes));
    this.nodesStatus$ = this.store.pipe(select(getNodesStatus));
    this.search();
  }

  search() {
    this.store.dispatch(new GetNodesAction(this.query));
  }
}
