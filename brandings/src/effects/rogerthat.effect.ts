import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RogerthatActions } from '../actions';
import * as actions from '../actions/rogerthat.actions';
import { RogerthatService } from '../services/rogerthat.service';
import { handleApiError } from '../util/rpc';

@Injectable()
export class RogerthatEffects {

  @Effect() listNews$ = this.actions$.pipe(
    ofType<actions.ListNewsAction>(actions.RogerthatActionTypes.LIST_NEWS),
    switchMap(action => this.rogerthatService.listNews(action.payload).pipe(
      map(result => new actions.ListNewsCompleteAction(result)),
      catchError(err => handleApiError(actions.ListNewsFailedAction, err)))));

  constructor(private actions$: Actions<RogerthatActions>,
              private rogerthatService: RogerthatService) {
  }
}
