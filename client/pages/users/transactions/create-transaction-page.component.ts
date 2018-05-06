import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IAppState } from '../../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../../framework/client/rpc';
import { CreateTransactionAction, ResetNewTransactionAction } from '../../../actions';
import { CreateTransactionPayload, TokenTypes } from '../../../interfaces';
import { createTransactionStatus } from '../../../tff.state';

@Component({
  selector: 'tff-create-transaction-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <h2>{{ 'tff.create_transaction' | translate }}</h2>
      <tff-create-transaction [transaction]="transaction"
                              [createStatus]="createStatus$ | async"
                              (onCreateTransaction)="createTransaction($event)"></tff-create-transaction>
    </div>`,
})
export class CreateTransactionPageComponent implements OnInit, OnDestroy {
  transaction: CreateTransactionPayload;
  createStatus$: Observable<ApiRequestStatus>;

  private _createSub: Subscription;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.transaction = {
      token_count: 0,
      token_type: TokenTypes.I,
      memo: null,
      username: (<ActivatedRoute>this.route.parent).snapshot.params.username,
    };
    this.store.dispatch(new ResetNewTransactionAction());
    this.createStatus$ = this.store.select(createTransactionStatus);
    this._createSub = this.createStatus$.pipe(filter(s => s.success))
      .subscribe(() => this.router.navigate([ '..' ], { relativeTo: this.route }));
  }

  ngOnDestroy() {
    this._createSub.unsubscribe();
  }

  createTransaction(transaction: CreateTransactionPayload) {
    this.store.dispatch(new CreateTransactionAction(transaction));
  }
}
