export interface StatisticValue {
  avg: number;
  count: number;
  max: number;
  start: number;
  total: number;
}

export interface NodeStatus {
  status: 'running' | 'halted';
  bootTime: number | null;
  network: {
    incoming: StatisticValue[];
    outgoing: StatisticValue[];
  };
  cpu: {
    utilisation: StatisticValue[]
  };
}
