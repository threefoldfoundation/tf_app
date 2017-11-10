import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AgendaEvent, EventPresence, UpdatePresenceData } from '../interfaces/agenda.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class AgendaService {

  constructor(private rogerthatService: RogerthatService) {
  }

  getEvents(): Observable<AgendaEvent[]> {
    return Observable.of(rogerthat.service.data.agenda_events || []);
  }

  getPresence(eventId: number) {
    return this.rogerthatService.apiCall<EventPresence>('agenda.get_presence', { event_id: eventId });
  }

  updatePresence(payload: UpdatePresenceData) {
    return this.rogerthatService.apiCall<UpdatePresenceData>('agenda.update_presence', payload);
  }
}
