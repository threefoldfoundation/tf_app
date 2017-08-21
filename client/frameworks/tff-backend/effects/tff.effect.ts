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
    .switchMap((action) => this.tffService.getNodeOrders(action.payload))
    .map(payload => new actions.GetOrdersCompleteAction(payload))
    .catch(err => handleApiError(actions.GetOrdersFailedAction, err));

  @Effect() getNodeOrdes$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.GET_ORDER)
    .switchMap((action) => this.tffService.getNodeOrder(action.payload))
    .map(payload => new actions.GetOrderCompleteAction(payload))
    .catch(err => handleApiError(actions.GetOrderFailedAction, err));

  @Effect() updateNodeOrdes$: Observable<Action> = this.actions$
    .ofType(actions.TffActionTypes.UPDATE_ORDER)
    .switchMap((action) => this.tffService.updateNodeOrder(action.payload))
    .map(payload => new actions.UpdateOrderCompleteAction(payload))
    .catch(err => handleApiError(actions.UpdateOrderFailedAction, err));

  constructor(private actions$: Actions,
              private tffService: TffService) {
  }
}
