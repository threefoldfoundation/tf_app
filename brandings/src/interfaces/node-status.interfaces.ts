export enum NodeStatus {
  RUNNING = 'running',
  HALTED = 'halted',
  REBOOTING = 'rebooting',
}

export interface NodeStatusTime {
  status: NodeStatus;
  date: string;
}

export interface NodeInfo {
  status: NodeStatus;
  id: string;
  serial_number: string;
  statuses?: NodeStatusTime[];
  status_date?: string;
  last_check?: string;
  stats?: NodeStatsData[];
}

export enum NodeStatsType {
  CPU = 'machine.CPU.percent',
  RAM = 'machine.memory.ram.available',
  NETWORK_OUT = 'network.throughput.incoming',
  NETWORK_IN = 'network.throughput.outgoing',
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
