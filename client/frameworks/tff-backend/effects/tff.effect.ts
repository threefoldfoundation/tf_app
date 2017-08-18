// angular
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
// libs
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// module
import { TffService } from '../services/tff.service';
import * as actions from '../actions/threefold.action';
import { handleApiError } from '../services/rpc.service';

@Injectable()
export class TffEffects {

  @Effect() getNodeOrders$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_ORDERS)
    .switchMap(() => this.tffService.getNodeOrders())
    .map(payload => new actions.GetOrdersCompleteAction(payload))
    .catch(err => handleApiError(actions.GetOrdersFailedAction, err));

  constructor(private actions$: Actions,
              private tffService: TffService) {
  }
}
