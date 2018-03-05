import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { GetAddresssAction, ScanQrCodeAction } from '../../actions';
import { IAppState } from '../../app/app.state';
import { ADDRESS_LENGTH, CreateSignatureData, KEY_NAME, RIVINE_ALGORITHM } from '../../interfaces/wallet';
import { CryptoAddress, QrCodeScannedContent } from '../../manual_typings/rogerthat';
import { getAddress, getQrCodeContent } from '../../state/rogerthat.state';
import { ConfirmSendPageComponent } from './confirm-send-page.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'send-page.component.html',
})
export class SendPageComponent implements OnInit, OnDestroy {
  address$: Observable<CryptoAddress>;
  addressLength = ADDRESS_LENGTH;
  data: CreateSignatureData;

  private _addressSubscription: Subscription;
  private _qrCodeContentSubscription: Subscription;

  constructor(private store: Store<IAppState>,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private translate: TranslateService,
              private cdRef: ChangeDetectorRef) {
    this.data = this._getDefaultData();
  }

  ngOnInit() {
    this.store.dispatch(new GetAddresssAction({
      algorithm: RIVINE_ALGORITHM,
      index: 0,
      keyName: KEY_NAME,
      message: this.translate.instant('please_enter_your_pin'),
    }));
    this.address$ = <Observable<CryptoAddress>>this.store.pipe(select(getAddress), filter(a => a !== null));
    this._addressSubscription = this.address$.subscribe(a => {
      this.data.from_address = a.address;
    });
    this._qrCodeContentSubscription = this.store.pipe(
      select(getQrCodeContent),
      filter(r => r !== null && r.status === 'resolved'),
    ).subscribe((result: QrCodeScannedContent) => {
      if (result.content.includes(':')) {
        const [ address, amount ] = result.content.split(':');
        this.data.to_address = address;
        this.data.amount = parseFloat(amount);
        this.cdRef.markForCheck();
      } else {
        this.alertCtrl.create({ message: this.translate.instant('unknown_qr_code_scanned') });
      }
    });
  }

  ngOnDestroy() {
    this._addressSubscription.unsubscribe();
    this._qrCodeContentSubscription.unsubscribe();
  }

  submit(form: NgForm) {
    if (!form.form.valid || !this.data.from_address) {
      return;
    }
    const modal = this.modalCtrl.create(ConfirmSendPageComponent, {
      transactionData: {
        ...this.data,
        amount: Math.round(this.data.amount * Math.pow(10, 5)),
      },
    });
    modal.onDidDismiss((successful: boolean) => {
      if (successful) {
        const config = {
          title: this.translate.instant('transaction_complete'),
          message: this.translate.instant('transaction_complete_message'),
          buttons: [ { text: this.translate.instant('ok') } ],
        };
        this.alertCtrl.create(config).present();
        this.data = this._getDefaultData();
        this.cdRef.markForCheck();
      }
    });
    modal.present();
  }

  scanQr() {
    this.store.dispatch(new ScanQrCodeAction('front'));
  }

  private _getDefaultData() {
    return {
      amount: 0,
      precision: 5,
      from_address: '',
      to_address: '',
    };
  }
}
