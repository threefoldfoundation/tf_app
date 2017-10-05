import { SeeDocumentDetails } from './iyo-see.interfaces';

export enum NodeOrderStatuses {
  CANCELED = -1,
  APPROVED = 0,
  SIGNED = 1,
  SENT = 2,
  ARRIVED = 3,
  WAITING_APPROVAL = 4,
}

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
  arrival_qr_code_url: string | null;
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

export const ORDER_STATUSES = {
  [ NodeOrderStatuses.CANCELED ]: 'tff.canceled',
  [ NodeOrderStatuses.APPROVED ]: 'tff.approved',
  [ NodeOrderStatuses.SIGNED ]: 'tff.signed',
  [ NodeOrderStatuses.SENT ]: 'tff.sent',
  [ NodeOrderStatuses.ARRIVED ]: 'tff.arrived',
  [ NodeOrderStatuses.WAITING_APPROVAL ]: 'tff.waiting_approval',
};
