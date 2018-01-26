import { InjectionToken } from '@angular/core';
import { ActionReducerMap } from '@ngrx/store';
import { IBrandingState } from '../state/app.state';
import { appReducer } from './app.reducer';

export interface IAppState {
  app: IBrandingState;
}

export const reducers = {
  app: appReducer,
};

export const REDUCER_INJECTION_TOKEN = new InjectionToken<ActionReducerMap<IAppState>>('Reducers');

export function getReducers() {
  return {
    app: appReducer,
  };
}

export const reducerProvider = [
  { provide: REDUCER_INJECTION_TOKEN, useFactory: getReducers },
];
