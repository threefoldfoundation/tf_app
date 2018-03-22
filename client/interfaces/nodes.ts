import { Profile } from '../../../its_you_online_auth/client/interfaces';

export enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
  REBOOTING = 'rebooting',
}

export interface NodeInfo {
  status: NodeStatus;
  id: string;
  serial_number: string;
  status_date?: string;
  last_check?: string;
}

export interface UserNodeStatus {
  profile: Profile | null;
  node: NodeInfo;
}

export interface NodesQuery {
  status: NodeStatus | null | '';
}
