import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { ApiError, ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { ApiCallError, ApiCallResult } from '../services/rogerthat.service';

export function transformApiCallErrorResponse(response: ApiCallResult): ApiRequestStatus {
  const apiError: ApiError = {
    error: <string>response.error,
    data: response.result ? JSON.parse(response.result) : null,
  };
  return {
    error: apiError,
    loading: false,
    success: false,
  };
}

export function transformErrorResponse<T = any>(response: HttpErrorResponse): ApiRequestStatus<T> {
  let apiError: ApiError<T>;
  if (typeof response.error === 'object' && !(response.error instanceof ProgressEvent)) {
    apiError = response.error;
  } else {
    // Most likely a non-json response
    apiError = {
      status_code: response.status,
      error: response.statusText,
      data: <any>{},
    };
  }
  if (apiError.status_code === 500) {
    apiError.error = 'unknown';
  }
  return {
    error: apiError,
    loading: false,
    success: false,
  };
}

export function handleApiError(action: any, response: ApiCallError) {
  return of(new action(transformApiCallErrorResponse(response.apiCallResult)));
}

export function handleError(action: any, response: HttpErrorResponse) {
  return of(new action(transformErrorResponse(response)));
}

export function parseQuery(queryString: string): { [ key: string ]: string } {
  const query: { [ key: string ]: string } = {};
  const pairs = (queryString[ 0 ] === '?' ? queryString.substr(1) : queryString).split('&');
  for (const pair of pairs) {
    const [ key, value ] = pair.split('=');
    query[ decodeURIComponent(key) ] = decodeURIComponent(value || '');
  }
  return query;
}
