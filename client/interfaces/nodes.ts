export const enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
}

export const enum WalletStatus {
  ERROR = 'error',
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
  last_update?: string;
  info: {
    kernelVersion: string;
    virtualizationRole: string;
    virtualizationSystem: string;
    uptime: number;
    procs: number;
    os: string;
    hostname: string;
    platformVersion: string;
    platform: string;
    platformFamily: string;
    bootTime: number;
    hostid: string;

  } | null;
  chain_status: ChainStatus | null;
}

export interface UpdateNodePayload {
  username: string | null;
}

export interface LimitedProfile {
  username: string;
  full_name: string | null;
  email: string | null;
}

export interface UserNodeStatus {
  profile: LimitedProfile | null;
  node: NodeInfo;
}

export interface NodesQuery {
  status: NodeStatus | null | '';
}
