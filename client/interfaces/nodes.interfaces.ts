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
  signature_payload: string;
  signature: string;
  order_time: number;
  modification_time: number;
  sign_time: number;
  send_time: number;
  arrival_time: number;
  cancel_time: number;
}
