import { SeeDocumentDetails } from './iyo-see.interfaces';

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
}

export interface NodeOrderDetail extends NodeOrder {
  see_document: SeeDocumentDetails;
}

export interface NodeOrderList {
  cursor: string | null;
  more: boolean;
  results: NodeOrder[];
}

export interface GetNodeOrdersPayload {
  cursor: string | null;
  status: NodeOrderStatuses;
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
