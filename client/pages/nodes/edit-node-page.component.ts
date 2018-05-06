import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { DialogService } from '../../../../framework/client/dialog';
import { filterNull } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { DeleteNodeAction, GetNodeAction, TffActions, TffActionTypes, UpdateNodeAction } from '../../actions';
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
                     (update)="onUpdate($event)"
                     (deleteNode)="onDeleteNode($event)"></tff-edit-node>
    </div>`,
})
export class EditNodePageComponent implements OnInit, OnDestroy {
  nodeId: string;
  node$: Observable<NodeInfo>;
  nodeStatus$: Observable<ApiRequestStatus>;
  updateNodeStatus$: Observable<ApiRequestStatus>;

  private _actionSubscription: Subscription;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute,
              private dialogService: DialogService,
              private translate: TranslateService,
              private actions$: Actions<TffActions>,
              private router: Router) {
  }

  ngOnInit() {
    this.nodeId = this.route.snapshot.params.nodeId;
    this.store.dispatch(new GetNodeAction(this.nodeId));
    this.node$ = this.store.pipe(select(getNode), filterNull());
    this.nodeStatus$ = this.store.pipe(select(getNodeStatus));
    this.updateNodeStatus$ = this.store.pipe(select(updateNodeStatus));
    this._actionSubscription = this.actions$.pipe(ofType(TffActionTypes.DELETE_NODE_COMPLETE)).subscribe(action => {
      this.router.navigate([ '..' ], { relativeTo: this.route });
    });
  }

  ngOnDestroy() {
    this._actionSubscription.unsubscribe();
  }

  onUpdate(payload: UpdateNodePayload) {
    this.store.dispatch(new UpdateNodeAction(this.nodeId, payload));
  }

  onDeleteNode(node: NodeInfo) {
    this.dialogService.openConfirm({
      ok: this.translate.instant('tff.ok'),
      cancel: this.translate.instant('tff.cancel'),
      message: this.translate.instant('tff.are_you_sure_you_want_to_delete_node_x', { node: node.id }),
      title: this.translate.instant('tff.confirmation'),
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(new DeleteNodeAction(node));
      }
    });
  }
}
