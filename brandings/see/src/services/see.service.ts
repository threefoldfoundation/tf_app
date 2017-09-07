import { Injectable } from '@angular/core';
import { SeeDocument, SeeDocumentDetails } from '../interfaces/see.interfaces';
import { RogerthatService } from './rogerthat.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SeeService {

  constructor(private rogerthatService: RogerthatService) {
  }

  /**
   * Returns results from localStorage first and then emits again when stats from the server are fetched.
   * @return {Observable<SeeDocument[]>}
   */
  list(): Observable<SeeDocument[]> {
    const CACHE_KEY = 'see_documents';
    let local;
    try {
      local = Observable.of(<SeeDocument[]> (JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') || []));
    } catch (ignored) {
      local = Observable.of([]);
    }
    let remote = this.rogerthatService.apiCall<SeeDocument[]>('iyo.see.list')
      .do(result => localStorage.setItem(CACHE_KEY, JSON.stringify(result)));
    return local.merge(remote);
  }

  detail(uniqueid: string): Observable<SeeDocumentDetails> {
    return this.rogerthatService.apiCall<SeeDocumentDetails>('iyo.see.detail', { uniqueid: uniqueid });
  }
}
