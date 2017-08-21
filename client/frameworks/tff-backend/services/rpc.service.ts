import { Observable } from 'rxjs/Observable';
import { ApiRequestStatus } from '../interfaces/rpc.interfaces';
import { ApiErrorResponse } from '../../sample/interfaces/rpc.interfaces';
import { HttpResponse } from '@angular/common/http';

export function transformErrorResponse(response: HttpResponse<ApiErrorResponse>): ApiRequestStatus {
  let apiError = response.body;
  if (!apiError) {
    // Not a json response
    apiError = {
      status_code: response.status,
      error: response.statusText,
      data: {
        response: response.body,
      },
    };
  }
  return {
    error: apiError,
    loading: false,
    success: false
  };
}

export function handleApiError(action: any, response: HttpResponse<ApiErrorResponse>) {
  return Observable.of(new action(transformErrorResponse(response)));
}
