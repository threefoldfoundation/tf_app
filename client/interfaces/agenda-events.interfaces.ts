import { Profile } from '../../../its_you_online_auth/client/interfaces/user.interfaces';

export enum AgendaEventType {
  EVENT = 1,
  VIDEO_CALL = 2,
}

export const AGENDA_EVENT_TYPES = [
  { label: 'tff.event', value: AgendaEventType.EVENT },
  { label: 'tff.video_call', value: AgendaEventType.VIDEO_CALL },
];

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

export enum EventPresenceStatus {
  ABSENT = -1,
  UNKNOWN = 0,
  PRESENT = 1,
}

export interface EventParticipant {
  event_id: number;
  modification_timestamp: string;
  status: EventPresenceStatus;
  user: Profile;
  username: string;
  wants_recording: boolean;
}


export interface GetEventParticipantsPayload {
  event_id: number;
  cursor: string | null;
  page_size: number;
}
