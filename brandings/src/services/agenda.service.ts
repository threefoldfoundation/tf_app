import { Injectable } from '@angular/core';
import { EventPresence, UpdatePresenceData } from '../interfaces/agenda.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class AgendaService {

  constructor(private rogerthatService: RogerthatService) {
  }

  getPresence(eventId: number) {
    return this.rogerthatService.apiCall<EventPresence>('agenda.get_presence', { event_id: eventId });
  }

  updatePresence(payload: UpdatePresenceData) {
    return this.rogerthatService.apiCall<UpdatePresenceData>('agenda.update_presence', payload);
  }
}
