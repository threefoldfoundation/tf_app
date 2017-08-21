import { Observable } from 'rxjs/Observable';
import '@ngrx/core/add/operator/select';
import { compose } from '@ngrx/core/compose';
import * as fromTff from './states/index';
import { IAppState } from '../ngrx/state/app.state';

export function getTffState(state$: Observable<IAppState>) {
  return state$.select(s => s.tff);
}


export const getOrders = compose(fromTff.getOrders, getTffState);
export const getOrdersStatus = compose(fromTff.getOrdersStatus, getTffState);
export const getOrder = compose(fromTff.getOrder, getTffState);
export const getOrderStatus = compose(fromTff.getOrderStatus, getTffState);
export const updateOrderStatus = compose(fromTff.updateOrderStatus, getTffState);
