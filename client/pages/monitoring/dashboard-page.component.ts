import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { Subscription } from 'rxjs/Subscription';
import { ChannelService } from '../../../../framework/client/channel/services';
import { environment } from '../../../../framework/client/environments/environment';
import { GetFlowStatsAction } from '../../actions';
import { FirebaseFlowRun, FlowStats } from '../../interfaces';
import { ITffState } from '../../states';
import { getFlowStats } from '../../tff.state';

@Component({
  selector: 'tff-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="default-component-padding">
      <tff-dashboard [flowStats]="flowStats$ | async" [flowRuns]="flowRuns$ | async"></tff-dashboard>
    </div>`,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  flowStats$: Observable<FlowStats[]>;
  flowRuns$: Observable<any[]>;
  private _intervalSubscription: Subscription;

  constructor(private store: Store<ITffState>,
              private channelService: ChannelService) {
  }

  ngOnInit() {
    this._intervalSubscription = IntervalObservable.create(60 * 1000 * 5).pipe(
      startWith(0),
    ).subscribe(() => this.getStats());
    this.flowStats$ = this.store.select(getFlowStats);
    const prefix = environment.production ? '' : '/dev';
    // use any to bypass some weird compiler issue
    this.flowRuns$ = this.channelService.db
      .list<FirebaseFlowRun<string>[]>(`${prefix}/dashboard/flow_steps`, ref => ref.orderByChild('last_step_date').limitToLast(50))
      .valueChanges().pipe(map((results: any) => this.convertFlowRuns(results)));
  }

  ngOnDestroy() {
    this._intervalSubscription.unsubscribe();
  }

  private getStats() {
    let hours = 24 * 7;
    if (!environment.production) {
      hours = 5000;
    }
    const minDate = new Date(new Date().getTime() - 1000 * 3600 * hours);
    this.store.dispatch(new GetFlowStatsAction(minDate.toISOString()));
  }

  private convertFlowRuns(flowRuns: FirebaseFlowRun<string>[]): FirebaseFlowRun[] {
    return flowRuns.map(result => ({ ...result, last_step_date: new Date(result.last_step_date) })).reverse();
  }
}
