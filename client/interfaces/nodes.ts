import { Profile } from '../../../its_you_online_auth/client/interfaces';

export const enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
  REBOOTING = 'rebooting',
}

export const enum WalletStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export interface ChainStatus {
  block_height: number;
  timestamp: string;
  wallet_status: WalletStatus;
}

export interface NodeStatusTime {
  status: NodeStatus;
  date: string;
}

export interface NodeInfo {
  status: NodeStatus;
  id: string;
  serial_number: string;
  username: string;
  statuses: NodeStatusTime[];
  status_date?: string;
  last_check?: string;
  chain_status: ChainStatus | null;
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
