import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, NavParams, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { first, map, withLatestFrom } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { CreateSignatureDataAction, CreateTransactionDataAction } from '../../actions';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { CreateSignatureData, CreateTransactionResult, KEY_NAME, RIVINE_ALGORITHM } from '../../interfaces/wallet';
import { CryptoTransaction, CryptoTransactionData } from '../../manual_typings/rogerthat';
import {
  createTransactionStatus,
  getCreatedTransaction,
  getPendingTransaction,
  getPendingTransactionStatus,
  IBrandingState,
} from '../../state/app.state';
import { getTransactionAmount } from '../../util/wallet';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'confirm-send-page.component.html',
})
export class ConfirmSendPageComponent implements OnInit, OnDestroy {
  data: CreateSignatureData;
  pendingTransaction$: Observable<CryptoTransaction | null>;
  pendingTransactionStatus$: Observable<ApiRequestStatus>;
  createTransactionStatus$: Observable<ApiRequestStatus>;
  disableSubmit$: Observable<boolean>;
  transaction$: Observable<CreateTransactionResult | null>;

  private _transactionCompleteSub: Subscription;

  constructor(private store: Store<IBrandingState>,
              private viewCtrl: ViewController,
              private alertCtrl: AlertController,
              private params: NavParams,
              private translate: TranslateService) {
  }

  dismiss() {
    this.viewCtrl.dismiss(null);
  }

  ngOnInit() {
    this.data = this.params.get('transactionData');
    this.store.dispatch(new CreateSignatureDataAction(this.data));
    this.pendingTransaction$ = this.store.pipe(select(getPendingTransaction));
    this.pendingTransactionStatus$ = this.store.pipe(select(getPendingTransactionStatus));
    this.createTransactionStatus$ = this.store.pipe(select(createTransactionStatus));
    this.transaction$ = this.store.pipe(select(getCreatedTransaction));
    this.disableSubmit$ = this.pendingTransactionStatus$.pipe(
      withLatestFrom(this.createTransactionStatus$),
      map(([ pending, create ]) => pending.loading || create.loading),
    );
    this._transactionCompleteSub = this.createTransactionStatus$.pipe(
      withLatestFrom(this.transaction$),
    ).subscribe(([ status, transaction ]) => {
      if (status.success) {
        this.viewCtrl.dismiss(transaction);
      }
    });
  }

  ngOnDestroy() {
    this._transactionCompleteSub.unsubscribe();
  }

  submit() {
    const msg = this.translate.instant('enter_your_pin_to_sign_transaction');
    this.pendingTransaction$.pipe(first()).subscribe(transaction => {
      this.store.dispatch(new CreateTransactionDataAction(transaction!, KEY_NAME, RIVINE_ALGORITHM, 0, msg));
    });
  }

  getAmount(transaction: CryptoTransaction): number {
    return transaction.data
      .reduce((total: number, data: CryptoTransactionData) => total + getTransactionAmount(transaction.to_address, [], data.outputs), 0);
  }

  getTotalAmount(transaction: CryptoTransaction): number {
    return this.getAmount(transaction) + parseInt(transaction.minerfees);
  }
}

