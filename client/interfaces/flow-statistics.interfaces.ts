import { FlowStep, InstallationStatus } from '../../../rogerthat_api/client/interfaces';
import { PaginatedResult } from './shared.interfaces';

export const enum FlowRunStatus {
  STARTED = 0,
  IN_PROGRESS = 10,
  STALLED = 20,
  CANCELED = 30,
  FINISHED = 40
}

// Translation keys
export const enum FlowRunStatusStr {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  STALLED = 'stalled',
  CANCELED = 'canceled',
  FINISHED = 'finished',
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

export interface FirebaseFlowStep {
  step_id: string;
  answer_id: string;
  button: string;
}

export interface FirebaseFlowRun {
  id: string;
  last_step: FirebaseFlowStep;
  flow_name: string;
  status: FlowRunStatus;
}

export interface InstallationStats {
  [ key: string ]: InstallationStatus;
}

export type AggregatedInstallationStats = {[key in InstallationStatus]: number};

export interface AggregatedFlowRunStats {
  flowName: string;
  stats: {
    // Key = one of FlowRunStatus
    [ key: string ]: number;
  };
}


export type FlowRunList<DateType = Date> = PaginatedResult<FlowRun<DateType>>;

export interface UserFlowRunsQuery {
  username: string;
  page_size?: number;
  cursor?: string;
}

export interface StepStatistics {
  time_taken: number;
}

export interface FirebaseFlowStats {
  // Flow name
  [ key: string ]: {
    // flow run key
    [ key: string ]: FlowRunStatus;
  };
}

export interface FlowRunStatistics<DateType = Date> {
  last_step_date: DateType;
  total_time: number;
  steps: StepStatistics[];
  next_step: string;
}

export interface FlowRunQuery {
  cursor?: string | null;
  flow_name?: string;
  min_date?: string;
  page_size?: number;
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
