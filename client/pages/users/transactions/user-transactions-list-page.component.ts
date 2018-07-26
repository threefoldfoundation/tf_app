import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IAppState } from '../../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../../framework/client/rpc';
import { GetBalanceAction, GetUserTransactionsAction } from '../../../actions';
import { TransactionList, WalletBalance } from '../../../interfaces';
import { getBalance, getBalanceStatus, getUserTransactions, getUserTransactionsStatus } from '../../../tff.state';

@Component({
  selector: 'tff-user-transactions-list-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar>
      <h2>{{ 'tff.wallet' | translate }}</h2>
    </mat-toolbar>
    <tff-wallet-balance [balance]="balance$ | async" [status]="balanceStatus$ | async"></tff-wallet-balance>
    <mat-toolbar>
      <h2>{{ 'tff.transactions' | translate }}</h2>
    </mat-toolbar>
    <tff-transaction-list [transactionList]="transactionList$ | async"
                          [status]="transactionListStatus$ | async"></tff-transaction-list>`,
})

export class UserTransactionsListPageComponent implements OnInit {
  transactionList$: Observable<TransactionList>;
  transactionListStatus$: Observable<ApiRequestStatus>;
  balance$: Observable<WalletBalance[]>;
  balanceStatus$: Observable<ApiRequestStatus>;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const username = (<ActivatedRoute>this.route.parent).snapshot.params.username;
    this.store.dispatch(new GetUserTransactionsAction(username));
    this.store.dispatch(new GetBalanceAction(username));
    this.transactionList$ = this.store.select(getUserTransactions);
    this.balance$ = this.store.select(getBalance);
    this.balanceStatus$ = this.store.select(getBalanceStatus);
    this.transactionListStatus$ = this.store.select(getUserTransactionsStatus);
  }
}
