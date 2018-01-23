export interface StatisticValue {
  avg: number;
  count: number;
  max: number;
  start: number;
  total: number;
}

export interface BaseNodeStatus {
  status: 'running' | 'halted';
}

export interface NodeStatusStats extends BaseNodeStatus {
  bootTime: number | null;
  network: {
    incoming: StatisticValue[];
    outgoing: StatisticValue[];
  };
  cpu: {
    utilisation: StatisticValue[]
  };
}

export type NodeStatus = BaseNodeStatus | NodeStatusStats;
