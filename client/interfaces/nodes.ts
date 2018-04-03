import { Profile } from '../../../its_you_online_auth/client/interfaces';
import { NodeStatusTime } from '../../brandings/src/interfaces/node-status.interfaces';

export enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
  REBOOTING = 'rebooting',
}

export interface NodeInfo {
  status: NodeStatus;
  id: string;
  serial_number: string;
  username: string;
  statuses: NodeStatusTime[];
  status_date?: string;
  last_check?: string;
}

export interface UpdateNodePayload {
  username: string | null;
}

export interface UserNodeStatus {
  profile: Profile | null;
  node: NodeInfo;
}

export interface NodesQuery {
  status: NodeStatus | null | '';
}
