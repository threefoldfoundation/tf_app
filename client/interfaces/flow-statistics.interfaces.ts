import { FlowStep } from '../../../rogerthat_api/client/interfaces/forms';
import { PaginatedResult } from './shared.interfaces';

export enum FlowRunStatus {
  STARTED = 0,
  IN_PROGRESS = 10,
  STALLED = 20,
  CANCELED = 30,
  FINISHED = 40
}

export interface FlowRun<DateType = Date> {
  flow_name: string;
  id: string;
  start_date: DateType;
  status: FlowRunStatus;
  statistics: FlowRunStatistics<DateType>;
  steps?: FlowStep[];
  tag: string;
  user: string;
}

export type FlowRunList<DateType = Date> = PaginatedResult<FlowRun<DateType>>;

export interface StepStatistics {
  time_taken: number;
}

export interface FlowRunStatistics<DateType = Date> {
  last_step_date: DateType;
  total_time: number;
  steps: StepStatistics[];
  next_step: string;
}

export interface FlowRunQuery {
  cursor: string | null;
  flow_name: string;
  max_date?: string;
  per_page?: number;
}

export const FLOW_RUN_STATUSES = [
  { label: 'tff.started', value: FlowRunStatus.STARTED },
  { label: 'tff.in_progress', value: FlowRunStatus.IN_PROGRESS },
  { label: 'tff.stalled', value: FlowRunStatus.STALLED },
  { label: 'tff.canceled', value: FlowRunStatus.CANCELED },
  { label: 'tff.finished', value: FlowRunStatus.FINISHED },
];

export const FLOW_RUN_STATUSES_MAPPING = {
  [ FlowRunStatus.STARTED ]: 'tff.started',
  [ FlowRunStatus.IN_PROGRESS ]: 'tff.in_progress',
  [ FlowRunStatus.STALLED ]: 'tff.stalled',
  [ FlowRunStatus.CANCELED ]: 'tff.canceled',
  [ FlowRunStatus.FINISHED ]: 'tff.finished',
};
