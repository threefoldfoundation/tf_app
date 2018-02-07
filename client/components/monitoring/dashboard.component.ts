import { DatePipe, I18nPluralPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { BreakPointRegistry, MatchMedia } from '@angular/flex-layout';
import { BreakPoint } from '@angular/flex-layout/typings/media-query/breakpoints/break-point';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MOBILE_TYPES } from '../../../../rogerthat_api/client/interfaces';
import {
  AggregatedFlowRunStats,
  AggregatedInstallationStats,
  FirebaseFlowRun,
  FlowRunStatus,
  TickerEntry,
  TickerEntryType,
} from '../../interfaces';
import { TimeDurationPipe } from '../../pipes/time-duration.pipe';
import { FlowStatisticsService } from '../../services';
import { getStepTitle } from '../../util';
import BarChartOptions = google.visualization.BarChartOptions;
import ChartSpecs = google.visualization.ChartSpecs;

export interface BarChart extends ChartSpecs {
  options: BarChartOptions;
}

export enum ChartColor {
  GREEN = '#109618',
  RED = '#dc3912',
  BLUE = '#3366cc',
  ORANGE = '#ff9900',
  PURPLE = '#990099',
}

@Component({
  selector: 'tff-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: 'dashboard.component.html',
  styleUrls: [ 'dashboard.component.css' ],
})
export class DashboardComponent implements OnChanges, OnDestroy {
  @HostListener('window:resize')
  onResize() {
    this.drawChartSubject.next();
  }
  @Input() flowStats: AggregatedFlowRunStats[];
  @Input() tickerEntries: TickerEntry[];
  @Input() installationStats: AggregatedInstallationStats;
  timeDuration = 86400 * 7;
  TickerEntryType = TickerEntryType;
  chart: BarChart;
  timeDurationPipe: TimeDurationPipe;
  breakPoint: BreakPoint;
  drawChartSubject = new Subject();

  private _chartSub: Subscription;

  constructor(private translate: TranslateService,
              private flowStatisticsService: FlowStatisticsService,
              private cdRef: ChangeDetectorRef,
              private i18nPluralPipe: I18nPluralPipe,
              private datePipe: DatePipe,
              private matchMedia: MatchMedia,
              private breakPoints: BreakPointRegistry) {
    this.timeDurationPipe = new TimeDurationPipe(cdRef, translate, i18nPluralPipe);
    this.breakPoint = <BreakPoint>breakPoints.findByAlias('lt-md');
    // todo debounce
    this._chartSub = this.drawChartSubject.asObservable().subscribe(() => this.createChart());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.flowStats || changes.installationStats) {
      if (this.flowStats && this.flowStats.length && this.installationStats) {
        this.drawChartSubject.next();
      }
    }
  }

  ngOnDestroy() {
    this._chartSub.unsubscribe();
  }

  getTickerText(entry: TickerEntry): string {
    if (entry.type === TickerEntryType.FLOW) {
      const flowRun = entry.data;
      const flowName = this.flowStatisticsService.getFlowName(flowRun.flow_name);
      if (flowRun.status === FlowRunStatus.STARTED) {
        return flowName;
      }
      if (flowRun.status === FlowRunStatus.FINISHED) {
        return flowName;
      }
      if (flowRun.status === FlowRunStatus.IN_PROGRESS) {
        if (flowRun.last_step) {
          return `${flowName}: ${getStepTitle(flowRun.last_step.step_id)} → Clicked "${getStepTitle(flowRun.last_step.button)}"`;
        }
        return flowName;
      }
      if (flowRun.status === FlowRunStatus.CANCELED) {
        return `${flowName}: Canceled at "${getStepTitle(flowRun.last_step.step_id)}" step`;
      }
      if (flowRun.status === FlowRunStatus.STALLED) {
        if (flowRun.last_step) {
          const time = this.datePipe.transform(entry.date, 'HH:mm');
          return `${flowName}: Stopped at step "${getStepTitle(flowRun.last_step.step_id)}" since ${time}`;
        }
        return flowName;
      }
    } else if (entry.type === TickerEntryType.INSTALLATION) {
      const platform = this.translate.instant(MOBILE_TYPES[ entry.data.platform ]);
      return this.translate.instant('tff.installation_on_platform', { platform: platform });
    } else {
      return JSON.stringify(entry);
    }
    return '';
  }

  trackTickerEntries(index: number, flowRun: FirebaseFlowRun) {
    return flowRun.id;
  }

  getTickerEntryUrl(tickerEntry: TickerEntry) {
    if (tickerEntry.type === TickerEntryType.FLOW) {
      return `/flow-statistics/${tickerEntry.data.flow_name}/${tickerEntry.data.id}`;
    } else {
      return `/installations/${tickerEntry.data.id}`;
    }
  }

  private createChart() {
    if (!this.flowStats || !this.installationStats) {
      return;
    }
    const header = [
      'Title',
      this.translate.instant('tff.started'),
      this.translate.instant('tff.in_progress'),
      this.translate.instant('tff.stalled'),
      this.translate.instant('tff.canceled'),
      this.translate.instant('tff.finished'),
      { role: 'annotation' } ];
    const flowStats = this.flowStats.map(s => ([
      this.flowStatisticsService.getFlowName(s.flowName),
      s.stats[ FlowRunStatus.STARTED ],
      s.stats[ FlowRunStatus.IN_PROGRESS ],
      s.stats[ FlowRunStatus.STALLED ],
      s.stats[ FlowRunStatus.CANCELED ],
      s.stats[ FlowRunStatus.FINISHED ],
      s.stats[ FlowRunStatus.STARTED ] + s.stats[ FlowRunStatus.IN_PROGRESS ] + s.stats[ FlowRunStatus.STALLED ]
      + s.stats[ FlowRunStatus.CANCELED ] + s.stats[ FlowRunStatus.FINISHED ],
    ]));
    const installStats = [
      this.translate.instant('tff.app_installations'),
      this.installationStats.started,
      this.installationStats.in_progress,
      0,
      0,
      this.installationStats.finished,
      this.installationStats.started + this.installationStats.in_progress + this.installationStats.finished,
    ];
    let width = Math.max(window.innerWidth - 700, 500);
    let height = Math.max(window.innerHeight - 150, 400);
    if (this.matchMedia.isActive(this.breakPoint.mediaQuery)) {
      width = window.innerWidth - 50;
      height = window.innerHeight - 90;
    }

    this.chart = {
      chartType: 'ColumnChart',
      options: {
        backgroundColor: 'transparent',
        bar: { groupWidth: '75%' },
        chartArea: { width: '90%' },
        colors: [ ChartColor.BLUE, ChartColor.ORANGE, ChartColor.PURPLE, ChartColor.RED, ChartColor.GREEN ],
        title: this.translate.instant('tff.stats_for_last_x', { time: this.timeDurationPipe.transform(this.timeDuration) }),
        width,
        height,
        legend: { position: 'bottom', alignment: 'center' },
        isStacked: true,
      },
      dataTable: [ header, ...flowStats, installStats ],
    };
  }

}
