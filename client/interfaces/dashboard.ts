import { InstallationStatus, MobileType } from '../../../rogerthat_api/client/interfaces';
import { FirebaseFlowRun } from './flow-statistics.interfaces';

export enum TickerEntryType {
  FLOW = 'flow',
  INSTALLATION = 'installation'
}

export interface BaseTickerEntry<T = Date> {
  date: T;
}

export interface TickerEntryFlow<T = Date> extends BaseTickerEntry {
  type: TickerEntryType.FLOW;
  data: FirebaseFlowRun;
}

export interface FirebaseInstallation {
  id: string;
  platform: MobileType;
  status: InstallationStatus;
  name: string | null;
}

export interface TickerEntryInstallation<T = Date> extends BaseTickerEntry {
  type: TickerEntryType.INSTALLATION;
  data: FirebaseInstallation;
}

export type TickerEntry<T = Date> = TickerEntryFlow<T> | TickerEntryInstallation<T>;
