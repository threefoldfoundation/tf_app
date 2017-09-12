import { Injectable } from '@angular/core';
import { GlobalStats } from '../interfaces/global-stats.interfaces';
import { RogerthatService } from './rogerthat.service';

@Injectable()
export class GlobalStatsService {

  constructor(private rogerthatService: RogerthatService) {
  }

  listStats() {
    return this.rogerthatService.apiCall<GlobalStats[]>('global_stats.list');
  }
}
