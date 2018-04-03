import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filterNull } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { GetNodeAction, UpdateNodeAction } from '../../actions';
import { NodeInfo, UpdateNodePayload } from '../../interfaces';
import { ITffState } from '../../states';
import { getNode, getNodeStatus, updateNodeStatus } from '../../tff.state';

@Component({
  selector: 'tff-edit-node-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <a mat-raised-button [routerLink]="['..']">
        <mat-icon>arrow_back</mat-icon>
        {{ 'tff.back' | translate }}
      </a>
      <tff-edit-node [node]="node$ | async"
                     [status]="nodeStatus$ | async"
                     [updateStatus]="updateNodeStatus$ | async"
                     (update)="onUpdate($event)"></tff-edit-node>
    </div>`,
})
export class EditNodePageComponent implements OnInit {
  nodeId: string;
  node$: Observable<NodeInfo>;
  nodeStatus$: Observable<ApiRequestStatus>;
  updateNodeStatus$: Observable<ApiRequestStatus>;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.nodeId = this.route.snapshot.params.nodeId;
    this.store.dispatch(new GetNodeAction(this.nodeId));
    this.node$ = this.store.pipe(select(getNode), filterNull());
    this.nodeStatus$ = this.store.pipe(select(getNodeStatus));
    this.updateNodeStatus$ = this.store.pipe(select(updateNodeStatus));
  }

  onUpdate(payload: UpdateNodePayload) {
    this.store.dispatch(new UpdateNodeAction(this.nodeId, payload));
  }
}
