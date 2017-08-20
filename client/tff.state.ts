// libs
import { Observable } from 'rxjs/Observable';
import '@ngrx/core/add/operator/select';
import { compose } from '@ngrx/core/compose';
import * as fromTff from './states/index';
import { IAppState } from '../../framework/client/ngrx/state/app.state';

export function getTffState(state$: Observable<IAppState>) {
  return state$.select(s => s.tff);
}


export const getOrders = compose(fromTff.getOrders, getTffState);
