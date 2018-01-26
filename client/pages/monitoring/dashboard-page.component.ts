import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { ChannelService } from '../../../../framework/client/channel/services';
import { environment } from '../../../../framework/client/environments/environment';
import { InstallationStatus } from '../../../../rogerthat_api/client/interfaces';
import { FirebaseFlowStats, FlowRunStatus, InstallationStats, TickerEntry } from '../../interfaces';
import { AggregatedFlowRunStats, AggregatedInstallationStats } from '../../interfaces/flow-statistics.interfaces';
import { ITffState } from '../../states';

@Component({
  selector: 'tff-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-dashboard [flowStats]="flowStats$ | async"
                     [tickerEntries]="tickerEntries$ | async"
                     [installationStats]="installations$ | async"></tff-dashboard>
    </div>`,
})
export class DashboardPageComponent implements OnInit {
  flowStats$: Observable<AggregatedFlowRunStats[]>;
  tickerEntries$: Observable<TickerEntry[]>;
  installations$: Observable<AggregatedInstallationStats>;

  constructor(private store: Store<ITffState>,
              private channelService: ChannelService) {
  }

  ngOnInit() {
    const prefix = environment.production ? '' : '/dev';
    this.flowStats$ = this.channelService.db.object<FirebaseFlowStats>(`${prefix}/dashboard/flows`).valueChanges()
      .pipe(map(results => this.converFlowStats(results)));
    this.installations$ = this.channelService.db.object<InstallationStats>(`${prefix}/dashboard/installations`).valueChanges()
      .pipe(map(stats => this.aggregateInstallationStats(stats)));
    this.tickerEntries$ = this.channelService.db
      .list<TickerEntry<string>>(`${prefix}/dashboard/ticker`, ref => ref.orderByChild('date').limitToLast(50))
      .valueChanges().pipe(map(results => this.convertTickerEntries(results)));
  }

  private convertTickerEntries(tickerEntries: TickerEntry<string>[]): TickerEntry<Date>[] {
    return tickerEntries.map(entry => ({ ...entry, date: new Date(entry.date) })).reverse();
  }

  private converFlowStats(results: FirebaseFlowStats | null): AggregatedFlowRunStats[] {
    if (!results) {
      return [];
    }
    return Object.keys(results).map(key => {
      const initialValue = {
        [ FlowRunStatus.STARTED ]: 0,
        [ FlowRunStatus.IN_PROGRESS ]: 0,
        [ FlowRunStatus.STALLED ]: 0,
        [ FlowRunStatus.FINISHED ]: 0,
        [ FlowRunStatus.CANCELED ]: 0,
      };
      const reducer = (accumulator: any, currentValue: FlowRunStatus) => {
        accumulator[ currentValue ] += 1;
        return accumulator;
      };
      return { flowName: key, stats: Object.values(results[ key ]).reduce(reducer, initialValue) };
    });
  }

  private aggregateInstallationStats(stats: InstallationStats | null): AggregatedInstallationStats {
    const reducer = (accumulator: AggregatedInstallationStats, currentValue: InstallationStatus) => {
      accumulator[ currentValue ] += 1;
      return accumulator;
    };
    const results: AggregatedInstallationStats = {
      [ InstallationStatus.STARTED ]: 0,
      [ InstallationStatus.IN_PROGRESS ]: 0,
      [ InstallationStatus.FINISHED ]: 0,
    };
    return stats ? Object.values(stats).reduce(reducer, results) : results;
  }
}
