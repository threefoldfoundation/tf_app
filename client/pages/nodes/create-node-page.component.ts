import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { DialogService } from '../../../../framework/client/dialog';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { CreateNodeAction, TffActions, TffActionTypes } from '../../actions';
import { CreateNodePayload } from '../../interfaces';
import { ITffState } from '../../states';
import { createNodeStatus } from '../../tff.state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <a mat-raised-button [routerLink]="['..']">
        <mat-icon>arrow_back</mat-icon>
        {{ 'tff.back' | translate }}
      </a>
      <tff-create-node [createStatus]="createStatus$ | async"
                       (createNode)="onCreateNode($event)"></tff-create-node>
    </div>`,
})
export class CreateNodePageComponent implements OnInit, OnDestroy {
  createStatus$: Observable<ApiRequestStatus>;

  private _actionSubscription: Subscription;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute,
              private dialogService: DialogService,
              private translate: TranslateService,
              private actions$: Actions<TffActions>,
              private router: Router) {
  }

  ngOnInit() {
    this.createStatus$ = this.store.pipe(select(createNodeStatus));
    this._actionSubscription = this.actions$.pipe(ofType(TffActionTypes.CREATE_NODE_COMPLETE)).subscribe(() => {
      this.router.navigate([ '..' ], { relativeTo: this.route });
    });
  }

  ngOnDestroy() {
    this._actionSubscription.unsubscribe();
  }

  onCreateNode(payload: CreateNodePayload) {
    this.store.dispatch(new CreateNodeAction(payload));
  }
}
