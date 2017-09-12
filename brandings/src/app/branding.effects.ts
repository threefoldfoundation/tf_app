import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import * as actions from '../actions/branding.actions';
import { GlobalStatsService } from '../services/global-stats.service';
import { SeeService } from '../services/see.service';
import { handleApiError } from '../util/rpc';
import { ReferrerService } from '../services/referrer.service';

@Injectable()
export class BrandingEffects {
  @Effect() getGlobalStats$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetGlobalStatsAction>(actions.BrandingActionTypes.GET_GLOBAL_STATS)
    .switchMap(action => this.globalStatsService.listStats()
      .map(stats => new actions.GetGlobalStatsCompleteAction(stats))
      .catch(err => handleApiError(actions.GetGlobalStatsFailedAction, err)));

  @Effect() getSeeDocuments$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.GetSeeDocumentsAction>(actions.BrandingActionTypes.GET_SEE_DOCUMENTS)
    .switchMap(action => this.seeService.list()
      .map(stats => new actions.GetSeeDocumentsCompleteAction(stats))
      .catch(err => handleApiError(actions.GetSeeDocumentsFailedAction, err)));

  @Effect() setReferrer$: Observable<actions.BrandingActions> = this.actions$
    .ofType<actions.SetReferrerAction>(actions.BrandingActionTypes.SET_REFERRER)
    .switchMap(action => this.referrerService.set(action.payload)
      .map(result => new actions.SetReferrerCompleteAction(result))
      .catch(err => handleApiError(actions.SetReferrerFailedAction, err)));

  constructor(private actions$: Actions,
              private globalStatsService: GlobalStatsService,
              private referrerService: ReferrerService,
              private seeService: SeeService) {
  }
}
