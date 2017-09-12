import { ActionReducer, ActionReducerMap, combineReducers } from '@ngrx/store';
import { InjectionToken } from '@angular/core';
import { appReducer } from './app.reducer';
import { IBrandingState } from '../state/app.state';

export interface IAppState {
  app: IBrandingState;
}

export const reducers = {
  app: appReducer,
};

export const combinedReducers: ActionReducer<IAppState> = combineReducers(reducers);

export const REDUCER_INJECTION_TOKEN = new InjectionToken<ActionReducerMap<IAppState>>('Reducers');

export function getReducers() {
  return {
    app: appReducer,
  };
}

export const reducerProvider = [
  { provide: REDUCER_INJECTION_TOKEN, useFactory: getReducers }
];
