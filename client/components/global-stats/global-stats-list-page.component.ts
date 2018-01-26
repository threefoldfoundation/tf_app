import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { GetGlobalStatsListAction } from '../../actions/threefold.action';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { getGlobalStatsList } from '../../tff.state';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-stats-list-page.component.html'
})

export class GlobalStatsListPageComponent implements OnInit {
  globalStats$: Observable<GlobalStats[]>;

  constructor(private store: Store<IAppState>) {
  }

  ngOnInit() {
    this.globalStats$ = this.store.select(getGlobalStatsList);
    this.store.dispatch(new GetGlobalStatsListAction());
  }
}
