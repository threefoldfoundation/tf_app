import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { GetGlobalStatsAction } from '../../actions/branding.actions';
import { IAppState } from '../../app/app.state';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { getGlobalStats, getGlobalStatsStatus } from '../../state/app.state';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-stats-page.component.html',
})
export class GlobalStatsPageComponent implements OnInit {
  globalStats$: Observable<GlobalStats[]>;
  status$: Observable<ApiRequestStatus>;

  constructor(private platform: Platform,
              private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.globalStats$ = this.store.select(getGlobalStats);
    this.status$ = this.store.select(getGlobalStatsStatus);
    this.store.dispatch(new GetGlobalStatsAction());
  }

  close() {
    this.platform.exitApp();
  }
}
