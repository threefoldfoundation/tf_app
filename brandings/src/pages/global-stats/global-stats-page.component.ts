import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { Observable } from 'rxjs/Observable';
import { Platform } from 'ionic-angular';
import { getGlobalStats, getGlobalStatsStatus } from '../../state/app.state';
import { Store } from '@ngrx/store';
import { IAppState } from '../../app/app.state';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { GetGlobalStatsAction } from '../../actions/branding.actions';

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
    this.globalStats$ = this.store.let(getGlobalStats);
    this.status$ = this.store.let(getGlobalStatsStatus);
    this.store.dispatch(new GetGlobalStatsAction());
  }

  close() {
    this.platform.exitApp();
  }
}
