import { Injectable, NgZone } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators/filter';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { Subject } from 'rxjs/Subject';
import { ApiCallAction, ApiCallCompleteAction, ScanQrCodeUpdateAction, SetServiceDataAction, SetUserDataAction } from '../actions';
import { IAppState } from '../app/app.state';
import { GetAddressPayload } from '../interfaces/wallet';
import {
  CameraType,
  CryptoAddress,
  CryptoSignature,
  CryptoTransaction,
  RogerthatCallbacks,
  SignatureData,
  SupportedAlgorithms,
} from '../manual_typings/rogerthat';
import { RogerthatError } from '../manual_typings/rogerthat-errors';
import { getApicallResult } from '../state/rogerthat.state';
import { I18nService } from './i18n.service';

export interface AppVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface ApiCallResult {
  method: string;
  result: string;
  error: string | null;
  tag: string;
}

export class ApiCallError extends Error {
  constructor(public message: string, public apiCallResult: ApiCallResult) {
    super(message);
  }
}

@Injectable()
export class RogerthatService {
  private _version: AppVersion;

  constructor(private i18nService: I18nService,
              private ngZone: NgZone,
              private store: Store<IAppState>) {
  }

  initialize() {
    this.store.dispatch(new SetUserDataAction(rogerthat.user.data));
    this.store.dispatch(new SetServiceDataAction(rogerthat.service.data));
    this.i18nService.use(rogerthat.user.language);
    rogerthat.api.callbacks.resultReceived((method: string, result: any, error: string | null, tag: string) => {
      this.ngZone.run(() => this.store.dispatch(new ApiCallCompleteAction({ method, result, error, tag })));
    });
    const cb = <RogerthatCallbacks>rogerthat.callbacks;
    cb.qrCodeScanned(result => this.ngZone.run(() => this.store.dispatch(new ScanQrCodeUpdateAction(result))));
    cb.userDataUpdated(() => this.ngZone.run(() => this.store.dispatch(new SetUserDataAction(rogerthat.user.data))));
    cb.serviceDataUpdated(() => this.ngZone.run(() => this.store.dispatch(new SetServiceDataAction(rogerthat.service.data))));
    const [ major, minor, patch ] = rogerthat.system.appVersion.split('.').slice(0, 3).map(s => parseInt(s));
    this._version = { major, minor, patch };
  }

  getContext(): Observable<any> {
    return Observable.create((emitter: Subject<any>) => {
      rogerthat.context(success, error);

      function success(context: any) {
        emitter.next(context);
        emitter.complete();
      }

      function error(err: RogerthatError) {
        emitter.error(err);
      }
    });
  }

  apiCall<T>(method: string, data?: any, tag?: string | null): Observable<T> {
    if (!tag) {
      tag = rogerthat.util.uuid();
    }
    if (data) {
      data = JSON.stringify(data);
    }
    this.store.dispatch(new ApiCallAction(method, data, tag));
    rogerthat.api.call(method, data, tag);
    return this.store.pipe(
      select(getApicallResult),
      filter(result => result !== null && result.method === method && result.tag === tag),
      tap(s => {
        if (s && s.error) {
          throw new ApiCallError(s.error, s);
        }
      }),
      map(result => <T>JSON.parse(result!.result || 'null')),
    );
  }

  startScanningQrCode(cameraType: CameraType): Observable<null> {
    const zone = this.ngZone;
    return Observable.create((emitter: Subject<null>) => {
      rogerthat.camera.startScanningQrCode(cameraType, success, error);

      function success() {
        zone.run(() => {
          emitter.next(null);
          emitter.complete();
        });
      }

      function error(err: RogerthatError) {
        zone.run(() => {
          emitter.error(err);
        });
      }
    });
  }

  /**
   * Returns the address, if it exists. else an error with code key_not_found will be emitted
   */
  getAddress(payload: GetAddressPayload): Observable<CryptoAddress> {
    return Observable.create((emitter: Subject<CryptoAddress>) => {
      const success = (result: CryptoAddress) => {
        this.ngZone.run(() => {
          emitter.next(result);
          emitter.complete();
        });
      };

      const error = (err: RogerthatError) => {
        this.ngZone.run(() => {
          emitter.error(err);
        });
      };
      rogerthat.security.getAddress(success, error, payload.algorithm, payload.keyName, payload.index, payload.message);
    });
  }

  createTransactionData(transaction: CryptoTransaction, algorithm: SupportedAlgorithms, keyName: string, index: number,
                        unlockMessage: string): Observable<CryptoTransaction> {
    const zone = this.ngZone;
    return Observable.create((emitter: Subject<CryptoTransaction>) => {
      rogerthat.payments.getTransactionData(success, error, algorithm, keyName, index, JSON.stringify(transaction));

      function success(signatureData: SignatureData) {
        const updatedTransaction: CryptoTransaction = JSON.parse(signatureData.data);
        let signedCounter = updatedTransaction.data.length;
        for (let i = 0; i < updatedTransaction.data.length; i++) {
          rogerthat.security.sign(signature => processSignature(signature, i), signError, algorithm, keyName, index, unlockMessage,
            updatedTransaction.data[ i ].signature_hash, false);
        }

        function processSignature(signature: CryptoSignature, dataIndex: number) {
          updatedTransaction.data[ dataIndex ].signature = signature.payload_signature;
          signedCounter--;
          if (signedCounter === 0) {
            // Everything signed, return updated transaction with signatures
            zone.run(() => {
              emitter.next(updatedTransaction);
              emitter.complete();
            });
          }
        }

        function signError(exception: RogerthatError) {
          error({ message: exception.message, code: 'failed_to_sign_transaction' });
        }
      }

      function error(err: RogerthatError) {
        zone.run(() => {
          emitter.error(err);
        });
      }
    });
  }
}
