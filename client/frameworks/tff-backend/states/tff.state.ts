import { Observable } from 'rxjs/Observable';
import { NodeOrder } from '../interfaces/nodes.interfaces';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';

export interface ITffState {
  orders: NodeOrder[];
  ordersStatus: ApiRequestStatus;
}

export const initialTffState: ITffState = {
  orders: [],
  ordersStatus: apiRequestInitial
};

export function getOrders(state$: Observable<ITffState>) {
  return state$.select(state => state.orders);
}

export function getOrdersStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.ordersStatus);
}
