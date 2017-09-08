import { Injectable } from '@angular/core';
import { SeeDocument, SeeDocumentDetails } from '../interfaces/see.interfaces';
import { RogerthatService } from './rogerthat.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SeeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  list(): Observable<SeeDocument[]> {
    return this.rogerthatService.apiCall<SeeDocument[]>('iyo.see.list');
  }

  detail(uniqueid: string): Observable<SeeDocumentDetails> {
    return this.rogerthatService.apiCall<SeeDocumentDetails>('iyo.see.detail', { uniqueid: uniqueid });
  }
}
