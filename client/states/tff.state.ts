import { Observable } from 'rxjs/Observable';
import { NodeOrder, NodeOrderList } from '../interfaces/nodes.interfaces';
import { apiRequestInitial, ApiRequestStatus } from '../interfaces/rpc.interfaces';

export interface ITffState {
  orders: NodeOrderList;
  ordersStatus: ApiRequestStatus;
  order: NodeOrder | null;
  orderStatus: ApiRequestStatus;
  updateOrderStatus: ApiRequestStatus;
}

export const initialTffState: ITffState = {
  orders: {
    cursor: null,
    more: false,
    results: []
  },
  ordersStatus: apiRequestInitial,
  order: null,
  orderStatus: apiRequestInitial,
  updateOrderStatus: apiRequestInitial
};

export function getOrders(state$: Observable<ITffState>) {
  return state$.select(state => state.orders);
}

export function getOrdersStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.ordersStatus);
}

export function getOrder(state$: Observable<ITffState>) {
  return state$.select(state => state.order);
}

export function getOrderStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.orderStatus);
}

export function updateOrderStatus(state$: Observable<ITffState>) {
  return state$.select(state => state.updateOrderStatus);
}
