import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { IAppState } from '../../../../framework/client/ngrx/state/app.state';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { Observable } from 'rxjs/Observable';
import { getGlobalStats } from '../../tff.state';
import { GetGlobalStatsAction, UpdateGlobalStatsAction } from '../../actions/threefold.action';

@Component({
  moduleId: module.id,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <global-stats-detail [globalStats]="globalStats$ | async" (onSave)="save($event)"></global-stats-detail>`
})

export class GlobalStatsDetailPageComponent implements OnInit {
  globalStats$: Observable<GlobalStats>;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    const statsId = this.route.snapshot.params.globalStatsId;
    this.store.dispatch(new GetGlobalStatsAction(statsId));
    this.globalStats$ = this.store.let(getGlobalStats).filter(s => s !== null);
  }

  save(globalStats: GlobalStats) {
    this.store.dispatch(new UpdateGlobalStatsAction(globalStats));
    this.router.navigate([ '..' ], { relativeTo: this.route });
  }
}
