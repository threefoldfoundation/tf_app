export const enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
}


export interface NodeInfo {
  status: NodeStatus;
  id: string;
  serial_number: string;
  status_date?: string;
  last_check?: string;
  stats?: NodeStatsData[];
}

export const enum NodeStatsType {
  CPU = 'machine.CPU.percent',
  RAM = 'machine.memory.ram.available',
  NETWORK_OUT = 'network.throughput.outgoing',
  NETWORK_IN = 'network.throughput.incoming',
}

export interface NodeStatsData {
  type: NodeStatsType;
  data: NodeStatsSeries[];
}

export interface NodeStatsSeries {
  columns: string[];
  name: 'node-stats';
  tags?: { subtype: string };
  values: [ string, number ][];
}
