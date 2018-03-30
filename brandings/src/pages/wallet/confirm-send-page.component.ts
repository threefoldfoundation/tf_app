import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, NavParams, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { first, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { BrandingActionTypes, CreateSignatureDataAction, CreateTransactionDataAction } from '../../actions';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { CreateSignatureData, CreateTransactionResult, KEY_NAME, RIVINE_ALGORITHM } from '../../interfaces/wallet';
import { CryptoTransaction } from '../../manual_typings/rogerthat';
import {
  createTransactionStatus,
  getCreatedTransaction,
  getPendingTransaction,
  getPendingTransactionStatus,
  IBrandingState,
} from '../../state/app.state';

declare var Zone: any;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'confirm-send-page.component.html',
})
export class ConfirmSendPageComponent implements OnInit, OnDestroy {
  data: CreateSignatureData;
  pendingTransaction$: Observable<CryptoTransaction | null>;
  pendingTransactionStatus$: Observable<ApiRequestStatus>;
  createTransactionStatus$: Observable<ApiRequestStatus>;
  transaction$: Observable<CreateTransactionResult | null>;

  private _transactionCompleteSub: Subscription;

  constructor(private store: Store<IBrandingState>,
              private viewCtrl: ViewController,
              private alertCtrl: AlertController,
              private params: NavParams,
              private translate: TranslateService,
              private actions$: Actions) {
  }

  dismiss() {
    this.viewCtrl.dismiss(null);
  }

  ngOnInit() {
    this.data = this.params.get('transactionData');
    console.log('=======zone=============', Zone.current.name);
    this.store.dispatch(new CreateSignatureDataAction(this.data));
    this.pendingTransaction$ = this.store.pipe(select(getPendingTransaction));
    this.pendingTransactionStatus$ = this.store.pipe(select(getPendingTransactionStatus));
    this.createTransactionStatus$ = this.store.pipe(select(createTransactionStatus));
    this.transaction$ = this.store.pipe(select(getCreatedTransaction));
    this._transactionCompleteSub = this.actions$.pipe(
      ofType(BrandingActionTypes.CREATE_TRANSACTION_COMPLETE),
      switchMap(() => this.transaction$),
    ).subscribe(transaction => {
        this.viewCtrl.dismiss(transaction);
    });
  }

  ngOnDestroy() {
    this._transactionCompleteSub.unsubscribe();
  }

  onConfirm() {
    const msg = this.translate.instant('enter_your_pin_to_sign_transaction');
    this.pendingTransaction$.pipe(first()).subscribe(transaction => {
      this.store.dispatch(new CreateTransactionDataAction(transaction!, KEY_NAME, RIVINE_ALGORITHM, 0, msg));
    });
  }
}

