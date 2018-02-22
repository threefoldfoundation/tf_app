export interface StatisticValue {
  avg: number;
  count: number;
  max: number;
  start: number;
  total: number;
}

export enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
  REBOOTING = 'rebooting',
}

export interface NodeInfo {
  status: NodeStatus;
  id: string;
  serial_number: string;
  stats?: NodeStatusStats;
}

export interface NodeStatusStats {
  bootTime: number | null;
  network: {
    incoming: StatisticValue[];
    outgoing: StatisticValue[];
  };
  cpu: {
    utilisation: StatisticValue[]
  };
}
