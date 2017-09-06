import { Injectable } from '@angular/core';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { RogerthatService } from './rogerthat.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GlobalStatsService {

  constructor(private rogerthatService: RogerthatService) {
  }

  /**
   * Returns results from localStorage first and then emits again when stats from the server are fetched.
   * @return {Observable<GlobalStats[]>}
   */
  listStats(): Observable<GlobalStats[]> {
    const CACHE_KEY = 'global_stats';
    let local;
    try {
      local = Observable.of(<GlobalStats[]> (JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') || []));
    } catch (ignored) {
      local = Observable.of([]);
    }
    let remote = this.rogerthatService.apiCall<GlobalStats[]>('global_stats.list')
      .do(result => localStorage.setItem(CACHE_KEY, JSON.stringify(result)));
    return local.merge(remote);
  }
}
