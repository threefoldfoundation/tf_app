import { PaginatedResult } from './shared.interfaces';

export enum NodeOrderStatuses {
  CANCELED = -1,
  APPROVED = 0,
  SIGNED = 1,
  SENT = 2,
  ARRIVED = 3,
  WAITING_APPROVAL = 4,
  PAID = 5,
}

export const NODE_ORDER_STATUS_MAPPING: { [ key: number ]: NodeOrderStatuses[] } = {
  [ NodeOrderStatuses.CANCELED ]: [],
  [ NodeOrderStatuses.WAITING_APPROVAL ]: [ NodeOrderStatuses.CANCELED, NodeOrderStatuses.APPROVED ],
  [ NodeOrderStatuses.APPROVED ]: [ NodeOrderStatuses.CANCELED, NodeOrderStatuses.SIGNED ],
  [ NodeOrderStatuses.SIGNED ]: [ NodeOrderStatuses.CANCELED, NodeOrderStatuses.PAID ],
  [ NodeOrderStatuses.PAID ]: [ NodeOrderStatuses.SENT ],
  [ NodeOrderStatuses.SENT ]: [],
  [ NodeOrderStatuses.ARRIVED ]: [],
};

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface NodeOrder {
  id: number;
  app_user: string;
  billing_info: ContactInfo;
  shipping_info: ContactInfo;
  status: NodeOrderStatuses;
  odoo_sale_order_id: string;
  tos_iyo_see_id: string;
  signature_payload: string | null;
  signature: string | null;
  order_time: number;
  modification_time: number;
  sign_time: number | null;
  send_time: number | null;
  arrival_time: number | null;
  cancel_time: number | null;
  socket: string;
  document_url: string | null;
  /**
   * Not set when listing node orders
   */
  username?: string;
}

export interface CreateOrderPayload<DateType = number> {
  app_user: string;
  billing_info: ContactInfo;
  shipping_info: ContactInfo;
  status: NodeOrderStatuses;
  order_time: DateType;
  sign_time: DateType;
  send_time: DateType;
  odoo_sale_order_id: number;
  document: string;
}

export interface NodeOrdersQuery {
  cursor: string | null;
  status: NodeOrderStatuses | null;
  query: string | null;
}

export interface NodeOrderList extends PaginatedResult<NodeOrder> {
}

export const ORDER_STATUSES = [
  { value: NodeOrderStatuses.WAITING_APPROVAL, label: 'tff.waiting_approval' },
  { value: NodeOrderStatuses.APPROVED, label: 'tff.approved' },
  { value: NodeOrderStatuses.SIGNED, label: 'tff.signed' },
  { value: NodeOrderStatuses.PAID, label: 'tff.paid' },
  { value: NodeOrderStatuses.SENT, label: 'tff.sent' },
  { value: NodeOrderStatuses.ARRIVED, label: 'tff.arrived_and_came_online' },
  { value: NodeOrderStatuses.CANCELED, label: 'tff.canceled' },
];

export const ORDER_STATUSES_DICT = {
  [ NodeOrderStatuses.WAITING_APPROVAL ]: 'tff.waiting_approval',
  [ NodeOrderStatuses.APPROVED ]: 'tff.approved',
  [ NodeOrderStatuses.SIGNED ]: 'tff.signed',
  [ NodeOrderStatuses.PAID ]: 'tff.paid',
  [ NodeOrderStatuses.SENT ]: 'tff.sent',
  [ NodeOrderStatuses.ARRIVED ]: 'tff.arrived_and_came_online',
  [ NodeOrderStatuses.CANCELED ]: 'tff.canceled',
};
