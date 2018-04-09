import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RogerthatActions } from '../actions';
import * as actions from '../actions/rogerthat.actions';
import { RogerthatService } from '../services/rogerthat.service';
import { handleError } from '../util/rpc';

@Injectable()
export class RogerthatEffects {

  @Effect() scanQrCode$ = this.actions$.pipe(
    ofType<actions.ScanQrCodeAction>(actions.RogerthatActionTypes.SCAN_QR_CODE),
    switchMap(action => this.rogerthatService.startScanningQrCode(action.payload).pipe(
      // Actual result is dispatched in rogerthatService via rogerthat.callbacks.qrCodeScanned
      map(() => new actions.ScanQrCodeStartedAction()),
      catchError(err => handleError(actions.ScanQrCodeFailedAction, err))),
    ));

  constructor(private actions$: Actions<RogerthatActions>,
              private rogerthatService: RogerthatService) {
  }
}
