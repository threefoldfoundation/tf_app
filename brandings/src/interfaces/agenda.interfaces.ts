export const enum AgendaEventType {
  EVENT = 1,
  VIDEO_CALL = 2,
}

export interface AgendaEvent {
  creation_timestamp: string;
  description: string;
  end_timestamp: string;
  type: AgendaEventType;
  id: number;
  title: string;
  start_timestamp: string;
  location: string;
}

export interface AgendaEventDetail extends AgendaEvent {
  end_date: string;
  start_date: string;
  is_in_past: boolean;
}

export enum EventPresenceStatus {
  ABSENT = -1,
  UNKNOWN = 0,
  PRESENT = 1,
}

export interface UpdatePresenceData {
  event_id: number;
  wants_recording: boolean;
  status: EventPresenceStatus;
}

export interface EventPresence extends UpdatePresenceData {
  present_count: number;
  absent_count: number;
}
