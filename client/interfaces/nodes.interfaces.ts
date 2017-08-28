export enum NodeOrderStatuses {
  CANCELED = -1,
  CREATED = 0,
  SIGNED = 1,
  SENT = 2,
  ARRIVED = 3
}

export interface NodeOrder {
  id: number;
  app_user: string;
  name: string;
  address: string;
  status: NodeOrderStatuses;
  tos_iyo_see_id: string;
  signature_payload: string | null;
  signature: string | null;
  order_time: number;
  modification_time: number;
  sign_time: number | null;
  send_time: number | null;
  arrival_time: number | null;
  cancel_time: number | null;
  arrival_qr_code_url: string | null;
}

export interface NodeOrderList {
  cursor: string | null;
  more: boolean;
  results: NodeOrder[];
}

export interface NodeOrderListPerStatus {
  cursor: string | null;
  more: boolean;
  results: {
    type: NodeOrderStatuses;
    orders: NodeOrder[];
  }[];
}

export const ORDER_STATUSES = {
  [NodeOrderStatuses.CANCELED]: 'tff.canceled',
  [NodeOrderStatuses.CREATED]: 'tff.created',
  [NodeOrderStatuses.SIGNED]: 'tff.signed',
  [NodeOrderStatuses.SENT]: 'tff.sent',
  [NodeOrderStatuses.ARRIVED]: 'tff.arrived',
};
