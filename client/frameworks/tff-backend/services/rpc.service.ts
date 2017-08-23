import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { ApiErrorResponse } from '../../sample/interfaces/rpc.interfaces';

export function transformErrorResponse(response: Response): ApiRequestStatus {
  let apiError: ApiErrorResponse;
  try {
    apiError = response.json();
  } catch (ignored) {
    // Most likely a non-json response
    apiError = {
      status_code: response.status,
      error: response.statusText,
      data: {
        response: response.text(),
      },
    };
  }
  return {
    error: apiError,
    loading: false,
    success: false
  };
}

export function handleApiError(action: any, response: Response) {
  return Observable.of(new action(transformErrorResponse(response)));
}
